import { GoogleGenAI, Type } from "@google/genai";
import { GeminiValidationResult, PatientIntakeData, TriageLevel } from "../types";
import { GEMINI_MODEL_NAME } from "./gemini";

/**
 * Validates patient intake payload using Gemini 3.6 Flash
 * Checks if patient name, age, and chief complaint make sense.
 */
export async function validateAndTriageIntake(
  intake: PatientIntakeData
): Promise<GeminiValidationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  const fallbackCheck = heuristicSanityCheck(intake);
  if (!apiKey || apiKey.trim() === "") {
    return fallbackCheck;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert Outpatient Department (OPD) Triage & Data Quality Validator for a hospital.
Your task is to analyze patient intake data and check if:
1. Patient name is a plausible human name (NOT random keyboard mash like "asdfgh", "qwerty", "12345").
2. Age is realistic (1 to 120 years old).
3. Chief complaint describes genuine medical symptoms, health concerns, or routine doctor visit reasons.

CRITICAL TRANSLATION REQUIREMENT FOR DOCTOR DATABASE:
- If the patient's name or chief complaint is entered in Hindi, Hinglish, or any regional Indian language (e.g., "2 दिनों से तेज सिरदर्द और बुखार", "छाती में दर्द", "बुखार"), you MUST automatically translate the sanitizedSummary into clear, professional clinical English for the doctor's database/screen (e.g., "High fever & severe headache for 2 days").

Input Patient Data:
- Name: "${intake.patient_name}"
- Age: "${intake.age || "Unspecified"}"
- Phone: "${intake.phone}"
- Chief Complaint / Symptoms: "${intake.chief_complaint}"
- Prior History: "${intake.prior_history || "None"}"

Response Rules:
- isValid: boolean (true if name and chief complaint make sense, false if gibberish, spam, or nonsense).
- reasoning: short 1-sentence explanation of your assessment.
- validationError: if isValid is false, provide a polite instruction to fix the input.
- sanitizedSummary: MUST BE IN ENGLISH - clean, concise clinical chief complaint for doctor's screen (translated to English if input was in Hindi/Hinglish).
- triageLevel: strictly one of "routine", "priority", "express".
- predictedMins: integer between 5 and 30 minutes for consultation duration.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN, description: "Whether input data makes sense" },
            reasoning: { type: Type.STRING, description: "Explanation of decision" },
            validationError: { type: Type.STRING, description: "User feedback if invalid" },
            sanitizedSummary: { type: Type.STRING, description: "Concise clinical chief complaint in ENGLISH" },
            triageLevel: {
              type: Type.STRING,
              enum: ["routine", "priority", "express"],
              description: "Operational triage priority",
            },
            predictedMins: { type: Type.INTEGER, description: "Estimated consultation minutes" },
          },
          required: ["isValid", "reasoning", "sanitizedSummary", "triageLevel", "predictedMins"],
        },
      },
    });

    const text = response?.text;
    if (!text) {
      return fallbackCheck;
    }

    const parsed = JSON.parse(text);

    return {
      isValid: Boolean(parsed.isValid),
      reasoning: parsed.reasoning || "Data validated by Gemini AI.",
      validationError: parsed.validationError || (parsed.isValid ? undefined : "Please provide valid personal and symptom details."),
      sanitizedSummary: parsed.sanitizedSummary || translateHindiToEnglish(intake.chief_complaint),
      triageLevel: (["routine", "priority", "express"].includes(parsed.triageLevel)
        ? parsed.triageLevel
        : "routine") as TriageLevel,
      predictedMins: Number(parsed.predictedMins) || 8,
    };
  } catch (err: any) {
    console.warn("[Gemini Intake Validation Fallback]:", err?.message || err);
    return fallbackCheck;
  }
}

/**
 * Basic Hindi to English dictionary translator for offline fallback
 */
function translateHindiToEnglish(text: string): string {
  if (!text) return text;
  let translated = text;

  const dictionary: Array<[RegExp, string]> = [
    [/बुखार/g, "fever"],
    [/सिरदर्द/g, "headache"],
    [/दर्द/g, "pain"],
    [/छाती/g, "chest"],
    [/खांसी/g, "cough"],
    [/गला/g, "throat"],
    [/चक्कर/g, "dizziness"],
    [/उल्टी/g, "vomiting"],
    [/पेट/g, "stomach"],
    [/2 दिन/g, "2 days"],
    [/3 दिन/g, "3 days"],
    [/तेज/g, "severe"],
  ];

  dictionary.forEach(([regex, replacement]) => {
    translated = translated.replace(regex, replacement);
  });

  return translated;
}

/**
 * Heuristic validation fallback when Gemini API key is unavailable
 */
function heuristicSanityCheck(intake: PatientIntakeData): GeminiValidationResult {
  const name = (intake.patient_name || "").trim();
  const complaint = (intake.chief_complaint || "").trim();

  // Basic gibberish heuristics
  const isKeyboardMash = /^(asdf|qwerty|zxcv|1234|test)/i.test(name.toLowerCase()) || /^(asdf|qwerty|zxcv|1234|test)/i.test(complaint.toLowerCase());
  const isRepeatedChar = /(.)\1{4,}/.test(complaint);

  if (name.length < 2 || isKeyboardMash) {
    return {
      isValid: false,
      reasoning: "Patient name or details appear invalid.",
      validationError: "Please enter a valid full name.",
      sanitizedSummary: complaint,
      triageLevel: "routine",
      predictedMins: 8,
    };
  }

  if (complaint.length < 3 || isRepeatedChar) {
    return {
      isValid: false,
      reasoning: "Chief complaint appears invalid or non-medical.",
      validationError: "Please describe your actual health concern or symptoms.",
      sanitizedSummary: complaint,
      triageLevel: "routine",
      predictedMins: 8,
    };
  }

  // Check for severe emergency keywords (English & Hindi)
  const emergencyKeywords = ["chest pain", "breathless", "unconscious", "stroke", "bleeding severe", "heart attack", "छाती में दर्द", "बेहोश"];
  const lowerComplaint = complaint.toLowerCase();
  const isEmergency = emergencyKeywords.some((kw) => lowerComplaint.includes(kw));

  const triageLevel: TriageLevel = isEmergency ? "express" : lowerComplaint.includes("fever") || lowerComplaint.includes("pain") || lowerComplaint.includes("बुखार") || lowerComplaint.includes("दर्द") ? "priority" : "routine";

  return {
    isValid: true,
    reasoning: "Input data verified via safety heuristics.",
    sanitizedSummary: translateHindiToEnglish(complaint),
    triageLevel,
    predictedMins: isEmergency ? 15 : 8,
  };
}
