"use client";

import React, { useState, useEffect, useRef } from "react";
import { PhoneCall, Mic, MicOff, Volume2, CheckCircle2, PhoneOff, Sparkles, Send, Bot } from "lucide-react";
import { PatientIntakeData } from "@/lib/types";
import { parseAge } from "@/lib/age-parser";

interface VoiceBotCallModalProps {
  phone: string;
  doctors: Array<{ id: string; name: string; department: string }>;
  onCompleted: (data: PatientIntakeData) => void;
  onCancel: () => void;
}

function getVoiceBotGreeting(): string {
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  }
  return `Namaste! ${greeting}. I am your ArogyaFlow AI Voice Assistant. May I know your full name?`;
}

const BOT_STEPS = [
  {
    key: "patient_name",
    question: "May I know your full name?",
    placeholder: "e.g. Ramesh Kumar",
    quickAnswers: ["Ramesh Kumar", "Priya Sharma", "Amit Patel"],
  },
  {
    key: "age",
    question: "Thank you! What is your age?",
    placeholder: "e.g. 42",
    quickAnswers: ["35", "42", "60"],
  },
  {
    key: "chief_complaint",
    question: "Please tell me what symptoms or health concern bring you to the hospital today?",
    placeholder: "e.g. Severe chest pain & dizziness since morning",
    quickAnswers: [
      "Severe chest pain & shortness of breath",
      "High fever and cough for 3 days",
      "Routine blood pressure follow-up",
    ],
  },
  {
    key: "prior_history",
    question: "Do you have any prior medical conditions, allergies, or diabetes?",
    placeholder: "e.g. Hypertension, No allergies",
    quickAnswers: ["Hypertension for 5 years", "Type 2 Diabetes", "No existing conditions"],
  },
];

export default function VoiceBotCallModal({
  phone,
  doctors,
  onCompleted,
  onCancel,
}: VoiceBotCallModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ sender: "bot" | "user"; text: string }>>(() => [
    { sender: "bot", text: getVoiceBotGreeting() },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [intakeData, setIntakeData] = useState<Partial<PatientIntakeData>>({
    phone,
    doctor_id: doctors[0]?.id || "doc_general_medicine_104",
  });
  const [isMuted, setIsMuted] = useState(false);

  // Speak bot question using SpeechSynthesis API
  const speakQuestion = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    speakQuestion(getVoiceBotGreeting());
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleNextStep = (answerText: string) => {
    if (!answerText.trim()) return;

    const currentStep = BOT_STEPS[stepIndex];

    let processedValue: any = answerText.trim();
    if (currentStep.key === "age") {
      const parsed = parseAge(answerText);
      if (parsed === null) {
        const retryMsg = "I couldn't understand your age. Please state your age in numbers or number words (e.g. 35 or fifteen).";
        setTranscript([...transcript, { sender: "bot", text: retryMsg }]);
        speakQuestion(retryMsg);
        return;
      }
      processedValue = parsed;
    }

    const updatedIntake = {
      ...intakeData,
      [currentStep.key]: processedValue,
    };
    setIntakeData(updatedIntake);

    const newTranscript = [
      ...transcript,
      { sender: "user" as const, text: answerText.trim() },
    ];

    if (stepIndex < BOT_STEPS.length - 1) {
      const nextIdx = stepIndex + 1;
      const nextQuestion = BOT_STEPS[nextIdx].question;
      setStepIndex(nextIdx);
      setTranscript([...newTranscript, { sender: "bot", text: nextQuestion }]);
      setCurrentInput("");
      speakQuestion(nextQuestion);
    } else {
      // Completed call
      setStepIndex(BOT_STEPS.length);
      const completionMsg = "Thank you! I have recorded all your details and sent them for Gemini AI validation.";
      setTranscript([...newTranscript, { sender: "bot", text: completionMsg }]);
      speakQuestion(completionMsg);

      setTimeout(() => {
        const finalAge = parseAge(updatedIntake.age) ?? 35;
        onCompleted({
          patient_name: updatedIntake.patient_name || "Patient",
          phone: phone,
          age: finalAge,
          gender: "Male",
          doctor_id: updatedIntake.doctor_id || doctors[0]?.id || "doc_general_medicine_104",
          chief_complaint: updatedIntake.chief_complaint || "Routine checkup",
          prior_history: updatedIntake.prior_history || "None",
        });
      }, 1500);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const handleVoiceListen = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      alert("Microphone access is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          mediaStreamRef.current = null;
        }
        setIsListening(false);

        if (audioChunks.length === 0) return;

        const recordedBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || "audio/webm" });
        if (recordedBlob.size === 0) return;

        try {
          const formData = new FormData();
          const ext = recordedBlob.type.includes("mp4") ? "m4a" : "webm";
          formData.append("audio", recordedBlob, `call_speech.${ext}`);
          formData.append("language", "en");

          const res = await fetch("/api/transcribe-whisper", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (res.ok && data.success && data.transcription) {
            setCurrentInput(data.transcription);
            handleNextStep(data.transcription);
          }
        } catch (err: any) {
          console.warn("Whisper call transcription error:", err);
        }
      };

      mediaRecorder.start(100);
      setIsListening(true);

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 6000);
    } catch (err: any) {
      setIsListening(false);
      console.warn("Mic access error:", err);
    }
  };

  const activeQuestion = BOT_STEPS[stepIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Call Top Header */}
        <div className="bg-slate-50/90 p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                ArogyaFlow Voice Assistant
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h3>
              <p className="text-[10px] text-primary font-mono font-semibold">
                Active Call • {phone} • Step {Math.min(stepIndex + 1, BOT_STEPS.length)} of {BOT_STEPS.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
              isMuted ? "bg-red-50 border-red-200 text-red-600 font-semibold" : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isMuted ? "Muted" : "Voice On"}</span>
          </button>
        </div>

        {/* Audio Soundwaves Visualizer */}
        <div className="h-14 bg-slate-50/60 border-b border-gray-100 flex items-center justify-center gap-1.5 px-4">
          {[40, 70, 30, 90, 50, 80, 45, 100, 60, 30, 80, 50, 90, 40].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-primary to-indigo-600 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* Live Conversation Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] bg-slate-50/30">
          {transcript.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                  msg.sender === "bot" ? "bg-primary/10 text-primary border border-primary/20" : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {msg.sender === "bot" ? "AI" : "You"}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "bot"
                    ? "bg-white text-foreground border border-gray-100 rounded-tl-none shadow-sm font-normal"
                    : "bg-primary text-white rounded-tr-none shadow-md shadow-primary/20 font-medium"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Active Input Controls */}
        {activeQuestion && (
          <div className="p-4 bg-white border-t border-gray-100 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider shrink-0">Quick Answers:</span>
              {activeQuestion.quickAnswers.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => handleNextStep(answer)}
                  className="px-2.5 py-1 rounded-full bg-primary/5 hover:bg-primary/15 text-primary border border-primary/15 text-[11px] font-semibold shrink-0 transition-all active:scale-95"
                >
                  {answer}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceListen}
                className={`p-3 rounded-2xl border transition-all ${
                  isListening
                    ? "bg-red-500 text-white border-red-500 animate-pulse shadow-md shadow-red-500/20"
                    : "bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary font-semibold"
                }`}
                title="Speak Answer"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNextStep(currentInput);
                }}
                placeholder={activeQuestion.placeholder}
                className="flex-1 px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />

              <button
                onClick={() => handleNextStep(currentInput)}
                disabled={!currentInput.trim()}
                className="p-3 rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-40 text-white transition-all shadow-md shadow-primary/25"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Call Footer End Call */}
        <div className="p-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-primary" />
            AI Voice Recording & Data Extraction Active
          </span>

          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
