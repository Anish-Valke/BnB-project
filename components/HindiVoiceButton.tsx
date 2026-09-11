"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface HindiVoiceButtonProps {
  myToken: number;
  estimatedWaitMins: number;
  patientsAhead: number;
}

export default function HindiVoiceButton({
  myToken,
  estimatedWaitMins,
  patientsAhead,
}: HindiVoiceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
    }
  }, []);

  const speak = () => {
    if (!isSupported) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    let textToSpeak = "";
    if (patientsAhead <= 0) {
      textToSpeak = `Aapka token number ${myToken} hai. Aapki baari aa gayi hai, kripya doctor ke kamre mein jaayein.`;
    } else {
      textToSpeak = `Aapka token number ${myToken} hai. Aapka intzaar ka samay lagbhag ${estimatedWaitMins} minute hai.`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "hi-IN";
    utterance.rate = 0.9; // Slightly slower for clarity

    // Try to find a native Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang.includes("hi") || v.lang.includes("hi-IN"));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8">
      <button
        onClick={isPlaying ? stop : speak}
        className={`shadow-lg border rounded-full py-3 px-5 flex items-center space-x-2 transition-colors active:scale-95 ${
          isPlaying
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-600/20"
            : "bg-white text-emerald-600 border-emerald-100 shadow-emerald-600/20 hover:bg-emerald-50"
        }`}
        aria-label={isPlaying ? "Stop audio" : "Play audio in Hindi"}
      >
        {isPlaying ? (
          <VolumeX className="w-5 h-5 animate-pulse" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
        <span className="font-bold text-sm">{isPlaying ? "रुकें" : "सुनें"}</span>
      </button>
    </div>
  );
}
