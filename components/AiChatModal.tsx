"use client";

import React, { useState, useEffect, useRef } from "react";
import { Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Send, Mic, MicOff, Volume2, X, Globe, Sparkles, Check } from "lucide-react";
import { PatientIntakeData } from "@/lib/types";
import { parseAge } from "@/lib/age-parser";

interface AiChatModalProps {
  phone: string;
  doctors: Array<{ id: string; name: string; department: string }>;
  onCompleted: (data: PatientIntakeData) => void;
  onCancel: () => void;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp?: string;
  copied?: boolean;
}

const STEPS_EN = [
  {
    key: "patient_name",
    question: "Hey! Good morning. What is your full name?",
    placeholder: "e.g. Aniket Sharma",
    quickAnswers: ["Aniket Sharma", "Ramesh Kumar", "Priya Verma"],
  },
  {
    key: "age",
    question: "Nice to meet you! How old are you?",
    placeholder: "e.g. 35",
    quickAnswers: ["28", "35", "45", "60"],
  },
  {
    key: "chief_complaint",
    question: "What health concern or symptoms are you experiencing today?",
    placeholder: "e.g. Severe headache and fever for 2 days",
    quickAnswers: [
      "High fever and chest pain",
      "Severe throat infection & body pain",
      "Routine blood pressure checkup",
    ],
  },
  {
    key: "prior_history",
    question: "Do you have any existing medical conditions or allergies?",
    placeholder: "e.g. Diabetes, Hypertension",
    quickAnswers: ["No prior medical history", "Hypertension", "Type 2 Diabetes"],
  },
];

const STEPS_HI = [
  {
    key: "patient_name",
    question: "नमस्ते! आपका शुभ नाम क्या है?",
    placeholder: "उदा. अनिकेत शर्मा",
    quickAnswers: ["अनिकेत शर्मा", "रमेश कुमार", "प्रिया वर्मा"],
  },
  {
    key: "age",
    question: "आपकी उम्र कितनी है?",
    placeholder: "उदा. 35",
    quickAnswers: ["28", "35", "45", "60"],
  },
  {
    key: "chief_complaint",
    question: "आज आपको क्या स्वास्थ्य समस्या या लक्षण अनुभव हो रहे हैं?",
    placeholder: "उदा. 2 दिनों से तेज सिरदर्द और बुखार",
    quickAnswers: [
      "तेज बुखार और छाती में दर्द",
      "गले का संक्रमण और बदन दर्द",
      "ब्लड प्रेशर की नियमित जांच",
    ],
  },
  {
    key: "prior_history",
    question: "क्या आपको कोई पुरानी बीमारी, एलर्जी या डायबिटीज है?",
    placeholder: "उदा. डायबिटीज, हाई बीपी",
    quickAnswers: ["कोई बीमारी नहीं", "हाई ब्लड प्रेशर", "टाइप 2 डायबिटीज"],
  },
];

export default function AiChatModal({
  phone,
  doctors,
  onCompleted,
  onCancel,
}: AiChatModalProps) {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [stepIndex, setStepIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [intakeData, setIntakeData] = useState<Partial<PatientIntakeData>>({
    phone,
    doctor_id: doctors[0]?.id || "doc_general_medicine_104",
  });

  const steps = language === "hi" ? STEPS_HI : STEPS_EN;
  const currentStep = steps[stepIndex];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: steps[0].question,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Robust Voice synthesis (TTS) in English & Hindi with Phonetic Fallback
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && isVoiceEnabled) {
      window.speechSynthesis.cancel();

      let textToSpeak = text;
      if (language === "hi") {
        if (text.includes("शुभ नाम")) {
          textToSpeak = "Namaste! Aapka shubh naam kya hai?";
        } else if (text.includes("उम्र कितनी")) {
          textToSpeak = "Aapki umar kitni hai?";
        } else if (text.includes("स्वास्थ्य समस्या")) {
          textToSpeak = "Aaj aapko kya swasthya samasya ya lakshan anubhav ho rahe hain?";
        } else if (text.includes("पुरानी बीमारी")) {
          textToSpeak = "Kya aapko koi purani beemari, allergy ya diabetes hai?";
        } else if (text.includes("सत्यापन")) {
          textToSpeak = "Dhanyavaad! Aapki sabhi jaankari darj kar li gayi hai.";
        }
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find((v) =>
        language === "hi"
          ? v.lang.includes("hi") ||
            v.lang.includes("hi-IN") ||
            v.name.toLowerCase().includes("hindi") ||
            v.name.toLowerCase().includes("hemant") ||
            v.name.toLowerCase().includes("kalpana") ||
            v.name.toLowerCase().includes("india")
          : v.lang.includes("en") || v.lang.includes("en-IN")
      );

      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    speakText(steps[0].question);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setCurrentInput("");

    let processedValue: any = text;
    if (currentStep.key === "age") {
      const parsed = parseAge(text);
      if (parsed === null) {
        const retryMsgText =
          language === "hi"
            ? "कृपया अपनी उम्र अंकों या शब्दों में बताएं (उदा. 35 या पंद्रह)।"
            : "Please state your age clearly in numbers or number words (e.g. 35 or fifteen).";
        setTimeout(() => {
          const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: retryMsgText,
          };
          setMessages([...newMessages, botMsg]);
          speakText(retryMsgText);
        }, 400);
        return;
      }
      processedValue = parsed;
    }

    const updatedIntake = {
      ...intakeData,
      [currentStep.key]: processedValue,
    };
    setIntakeData(updatedIntake);

    if (stepIndex < steps.length - 1) {
      const nextIdx = stepIndex + 1;
      const nextQuestion = steps[nextIdx].question;
      setStepIndex(nextIdx);

      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: nextQuestion,
        };
        setMessages([...newMessages, botMsg]);
        speakText(nextQuestion);
      }, 400);
    } else {
      // Final completion
      const completionText =
        language === "hi"
          ? "धन्यवाद! आपकी सभी जानकारी दर्ज कर ली गई है। जेमिनी एआई द्वारा सत्यापन किया जा रहा है..."
          : "Thank you! All your details have been recorded and sent for Gemini AI validation.";

      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: completionText,
        };
        setMessages([...newMessages, botMsg]);
        speakText(completionText);

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
            language,
          } as any);
        }, 1500);
      }, 400);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);

  // Real Microphone Voice Input Handler via MediaRecorder & OpenAI Whisper
  const handleWhisperVoiceInput = async () => {
    // If currently recording, stop recording
    if (isRecording) {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    setMicStatusMsg(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicStatusMsg(
        language === "hi"
          ? "माइक इस ब्राउज़र में समर्थित नहीं है।"
          : "Microphone access is not supported in this browser."
      );
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
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
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
        // Clean up stream tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        setIsRecording(false);

        if (audioChunks.length === 0) {
          setMicStatusMsg(
            language === "hi"
              ? "कोई ऑडियो दर्ज नहीं हुआ। फिर से प्रयास करें।"
              : "No audio captured. Please try speaking again."
          );
          return;
        }

        const recordedBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || "audio/webm" });

        if (recordedBlob.size === 0) {
          setMicStatusMsg(
            language === "hi"
              ? "खाली ऑडियो रिकॉर्डिंग। फिर से प्रयास करें।"
              : "Empty audio recording. Please try speaking again."
          );
          return;
        }

        setMicStatusMsg(
          language === "hi"
            ? "आपकी आवाज़ का ट्रांसक्रिप्शन हो रहा है... ⏳"
            : "Transcribing audio with Groq Whisper... ⏳"
        );

        try {
          const formData = new FormData();
          const ext = recordedBlob.type.includes("mp4") ? "m4a" : "webm";
          formData.append("audio", recordedBlob, `speech.${ext}`);
          formData.append("language", language);

          const res = await fetch("/api/transcribe-whisper", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (res.ok && data.success && data.transcription) {
            setMicStatusMsg(null);
            setCurrentInput(data.transcription);
            handleSendMessage(data.transcription);
          } else {
            setMicStatusMsg(
              data.error ||
                (language === "hi"
                  ? "ट्रांसक्रिप्शन विफल रहा। फिर से प्रयास करें।"
                  : "Whisper transcription failed. Please try speaking again.")
            );
          }
        } catch (err: any) {
          setMicStatusMsg(
            err.message ||
              (language === "hi"
                ? "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।"
                : "Network error during transcription. Please try again.")
          );
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setMicStatusMsg(
        language === "hi"
          ? "🔴 रिकॉर्डिंग चालू है... बोलिए 🎙️ (रोकने के लिए गोला दबाएं)"
          : "🔴 Recording active... Speak now 🎙️ (Tap orb when done)"
      );

      // Auto-stop recording after 7 seconds of continuous speech
      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 7000);
    } catch (err: any) {
      setIsRecording(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicStatusMsg(
          language === "hi"
            ? "माइक अनुमति ब्लॉक है। कृपया ब्राउज़र सेटिंग में अनुमति दें।"
            : "Microphone permission blocked. Please allow microphone access in settings."
        );
      } else {
        setMicStatusMsg(
          err.message || "Failed to access microphone. Please check settings."
        );
      }
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-xl bg-black border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
        {/* Header Bar */}
        <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                ArogyaFlow AI Chat
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  Whisper AI
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Toggle */}
            <button
              onClick={() => {
                const newLang = language === "en" ? "hi" : "en";
                setLanguage(newLang);
                setMessages([{ id: "1", sender: "bot", text: (newLang === "hi" ? STEPS_HI : STEPS_EN)[0].question }]);
                setStepIndex(0);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === "en" ? "English 🇬🇧" : "हिंदी 🇮🇳"}</span>
            </button>

            {/* Voice Mute Toggle */}
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-2 rounded-xl border text-xs transition-all ${
                isVoiceEnabled
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500"
              }`}
              title="Voice Audio Output"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={onCancel}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timestamp Header */}
        <div className="text-center py-2 text-[11px] text-zinc-500 font-medium">
          Today 11:02 AM
        </div>

        {/* ChatGPT Style Message Feed */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {msg.sender === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-5 py-2.5 rounded-3xl text-sm font-medium max-w-[80%] shadow-lg shadow-blue-600/10">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start space-y-2 max-w-[85%]">
                  <div className="text-white text-sm leading-relaxed font-normal">
                    {msg.text}
                  </div>
                  {/* ChatGPT Action Bar Icons */}
                  <div className="flex items-center gap-3 text-zinc-500 text-xs pt-1">
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-zinc-300 transition-colors flex items-center gap-1"
                      title="Copy"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button className="hover:text-zinc-300 transition-colors" title="Good Response">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button className="hover:text-zinc-300 transition-colors" title="Bad Response">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                    <button className="hover:text-zinc-300 transition-colors" title="More">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Answer Chips */}
        {currentStep && (
          <div className="px-6 py-2 border-t border-zinc-900 bg-zinc-950/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold shrink-0">Options:</span>
            {currentStep.quickAnswers.map((ans, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(ans)}
                className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-blue-400 text-xs font-medium shrink-0 transition-all"
              >
                {ans}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar & Glowing ChatGPT Voice Orb at Bottom */}
        <div className="p-6 bg-black border-t border-zinc-900 flex flex-col items-center gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(currentInput);
            }}
            className="w-full flex items-center gap-2"
          >
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={currentStep ? currentStep.placeholder : "Type message or use voice..."}
              className="flex-1 px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!currentInput.trim()}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-lg shadow-blue-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Live Recording Soundwave Indicator Banner */}
          {isRecording && (
            <div className="w-full py-2 px-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>{language === "hi" ? "🔴 रिकॉर्डिंग चालू है... बोलिए" : "🔴 Recording Active... Speak Now"}</span>
              </div>
              <div className="flex items-center gap-1">
                {[30, 70, 40, 90, 60, 100, 50, 80].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-400 rounded-full animate-bounce"
                    style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ChatGPT Glowing Pulsing Voice Orb (Matching Screenshot) */}
          <div className="flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={handleWhisperVoiceInput}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                isRecording
                  ? "bg-gradient-to-tr from-red-500 via-pink-600 to-red-500 shadow-[0_0_50px_rgba(239,68,68,0.9)] animate-pulse scale-110"
                  : "bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-400 shadow-[0_0_35px_rgba(59,130,246,0.6)] hover:scale-105"
              }`}
              title="Click to speak (Whisper AI Voice)"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                {isRecording ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
              </div>
            </button>
            <span className="text-[11px] text-zinc-300 font-semibold tracking-wide flex items-center gap-1.5">
              {isRecording ? (
                <span className="text-red-400 font-bold">Tap Orb to Stop & Send Voice</span>
              ) : (
                <span>{micStatusMsg || (language === "hi" ? "आवाज से बोलने के लिए गोला दबाएं" : "Tap Orb to Speak with Whisper AI")}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
