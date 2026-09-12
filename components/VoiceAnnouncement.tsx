"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Globe } from "lucide-react";

interface VoiceAnnouncementProps {
  textEn: string;
  textHi: string;
}

export default function VoiceAnnouncement({ textEn, textHi }: VoiceAnnouncementProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [lang, setLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
    } else {
      // Trigger voice loading for some browsers
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speak = () => {
    if (!isSupported) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const textToSpeak = lang === "hi-IN" ? textHi : textEn;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang;
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find((v) => v.lang.includes(lang.split('-')[0]));
    
    if (lang === "en-IN") {
       selectedVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en-GB")) || selectedVoice;
    }
    if (lang === "hi-IN") {
       selectedVoice = voices.find((v) => v.lang.includes("hi-IN") || v.lang.includes("hi")) || selectedVoice;
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);

  if (!isSupported) return null;

  return (
    <div className="flex items-center bg-surface border border-gray-200 rounded-full shadow-sm p-1 relative">
      <div 
        className="flex items-center pl-2 pr-1 border-r border-gray-200 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (!isPlaying) setShowDropdown(!showDropdown);
        }}
      >
        <Globe className="w-3.5 h-3.5 text-gray-400 mr-1" />
        <span className={`text-xs font-semibold pr-1 ${isPlaying ? "text-gray-400" : "text-gray-600"}`}>
          {lang === "en-IN" ? "EN" : "HI"}
        </span>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 w-24 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setLang("en-IN")}
              className={`w-full text-left px-3 py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors ${lang === "en-IN" ? "text-primary bg-primary/5" : "text-gray-600"}`}
            >
              English
            </button>
            <button
              onClick={() => setLang("hi-IN")}
              className={`w-full text-left px-3 py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors border-t border-gray-50 ${lang === "hi-IN" ? "text-primary bg-primary/5" : "text-gray-600"}`}
            >
              Hindi
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          isPlaying ? stop() : speak();
        }}
        className={`rounded-full py-1.5 px-3 flex items-center space-x-1.5 transition-colors active:scale-95 ${
          isPlaying
            ? "bg-primary/10 text-primary"
            : "hover:bg-gray-100 text-foreground"
        }`}
        aria-label={isPlaying ? "Stop audio" : "Play audio"}
      >
        {isPlaying ? (
          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-primary" />
        )}
        <span className="font-bold text-xs">{isPlaying ? (lang === 'hi-IN' ? "रुकें" : "Stop") : (lang === 'hi-IN' ? "सुनें" : "Listen")}</span>
      </button>
    </div>
  );
}
