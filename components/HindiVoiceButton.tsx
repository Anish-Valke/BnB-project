"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface HindiVoiceButtonProps {
  text: string;
}

export default function HindiVoiceButton({ text }: HindiVoiceButtonProps) {
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

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.9;

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

  if (!isSupported) return null;

  return (
    <button
      onClick={isPlaying ? stop : speak}
      className={`shadow-sm border rounded-full py-2 px-4 flex items-center space-x-2 transition-colors active:scale-95 ${
        isPlaying
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-surface hover:bg-surface-hover text-foreground border-gray-200"
      }`}
      aria-label={isPlaying ? "Stop audio" : "Play audio in Hindi"}
    >
      {isPlaying ? (
        <VolumeX className="w-4 h-4 animate-pulse" />
      ) : (
        <Volume2 className="w-4 h-4 text-primary" />
      )}
      <span className="font-semibold text-sm">{isPlaying ? "रुकें" : "सुनें"}</span>
    </button>
  );
}
