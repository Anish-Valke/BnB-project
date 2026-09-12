"use client";

import React, { useState, useEffect } from "react";
import { PhoneCall, Mic, MicOff, Volume2, CheckCircle2, PhoneOff, Sparkles, Send, Bot } from "lucide-react";
import { PatientIntakeData } from "@/lib/types";

interface VoiceBotCallModalProps {
  phone: string;
  doctors: Array<{ id: string; name: string; department: string }>;
  onCompleted: (data: PatientIntakeData) => void;
  onCancel: () => void;
}

const BOT_STEPS = [
  {
    key: "patient_name",
    question: "Namaste! I am your ArogyaFlow AI Voice Assistant. May I know your full name?",
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
  const [transcript, setTranscript] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
    { sender: "bot", text: BOT_STEPS[0].question },
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
    speakQuestion(BOT_STEPS[0].question);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleNextStep = (answerText: string) => {
    if (!answerText.trim()) return;

    const currentStep = BOT_STEPS[stepIndex];

    const updatedIntake = {
      ...intakeData,
      [currentStep.key]: answerText.trim(),
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
        onCompleted({
          patient_name: updatedIntake.patient_name || "Patient",
          phone: phone,
          age: updatedIntake.age || 35,
          gender: "Male",
          doctor_id: updatedIntake.doctor_id || doctors[0]?.id || "doc_general_medicine_104",
          chief_complaint: updatedIntake.chief_complaint || "Routine checkup",
          prior_history: updatedIntake.prior_history || "None",
        });
      }, 1500);
    }
  };

  const handleVoiceListen = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setCurrentInput(text);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.start();
    } else {
      alert("Voice recognition is not supported in this browser. Please use quick options or typing.");
    }
  };

  const activeQuestion = BOT_STEPS[stepIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Call Top Header */}
        <div className="bg-gradient-to-r from-teal-950 via-zinc-900 to-indigo-950 p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                ArogyaFlow Voice Assistant
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h3>
              <p className="text-[10px] text-teal-400 font-mono">
                Active Call • {phone} • Step {Math.min(stepIndex + 1, BOT_STEPS.length)} of {BOT_STEPS.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all ${
              isMuted ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-zinc-800 border-zinc-700 text-zinc-300"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isMuted ? "Muted" : "Voice On"}</span>
          </button>
        </div>

        {/* Audio Soundwaves Visualizer */}
        <div className="h-16 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-center gap-1.5 px-4">
          {[40, 70, 30, 90, 50, 80, 45, 100, 60, 30, 80, 50, 90, 40].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-teal-500 to-indigo-500 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* Live Conversation Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {transcript.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-medium ${
                  msg.sender === "bot" ? "bg-teal-900 text-teal-300" : "bg-indigo-900 text-indigo-300"
                }`}
              >
                {msg.sender === "bot" ? "AI" : "You"}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "bot"
                    ? "bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 rounded-tl-none"
                    : "bg-teal-600 text-white rounded-tr-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Active Input Controls */}
        {activeQuestion && (
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold shrink-0">Quick Answers:</span>
              {activeQuestion.quickAnswers.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => handleNextStep(answer)}
                  className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-zinc-700 text-[11px] font-medium shrink-0 transition-all"
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
                    ? "bg-red-600 text-white border-red-500 animate-pulse"
                    : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-teal-400"
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
                className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              <button
                onClick={() => handleNextStep(currentInput)}
                disabled={!currentInput.trim()}
                className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-all shadow-md shadow-teal-600/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Call Footer End Call */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" />
            AI Voice Recording & Data Extraction Active
          </span>

          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-400 font-medium text-xs flex items-center gap-1.5 transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
