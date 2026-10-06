'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AUTHENTIC_VOICE_PHRASES,
  VoicePhrase,
  voicePhraseEngine,
} from '@/lib/audio/voicePhrases';
import { soundEffects } from '@/lib/audio/soundEffects';

interface VoicePhraseSoundboardProps {
  onSendPhrase: (phrase: string, emoji: string) => void;
  disabled?: boolean;
}

export const VoicePhraseSoundboard: React.FC<VoicePhraseSoundboardProps> = ({
  onSendPhrase,
  disabled = false,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handlePhraseClick = (phrase: VoicePhrase) => {
    if (disabled) return;

    setPlayingId(phrase.id);
    soundEffects.playVoicePhraseAccent(phrase.soundToneFreq || 740);

    // Speak with Web Speech Synthesis (Turkish Voice)
    voicePhraseEngine.speak(
      phrase,
      () => setPlayingId(phrase.id),
      () => setPlayingId(null)
    );

    // Broadcast into real-time speech bubble & chat stream
    onSendPhrase(phrase.phrase, phrase.emoji);

    // Reset playing state after 2.5s if onend doesn't trigger
    setTimeout(() => {
      setPlayingId(prev => (prev === phrase.id ? null : prev));
    }, 2500);
  };

  return (
    <div className="w-full mt-2 select-none">
      <div className="relative rounded-2xl bg-gradient-to-r from-[#211108]/90 via-[#180c05]/90 to-[#100703]/90 border border-amber-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-xl p-2 sm:px-3 sm:py-2.5">
        {/* Top Header Row with Expand / Collapse */}
        <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">🗣️</span>
            <span className="font-serif-tavla font-black text-xs text-[#fef3c7] tracking-wide flex items-center gap-1.5">
              <span>Sesli Kahvehane İfadeleri</span>
              <span className="text-[10px] text-amber-400 font-normal hidden sm:inline">
                (Tıkla &amp; Seslendir)
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase font-bold text-amber-300/80 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              🎙️ Türkçe Ses
            </span>
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="w-5 h-5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-amber-200/80 flex items-center justify-center text-[10px] transition-colors"
              title={isExpanded ? 'Paneli Küçült' : 'Paneli Genişlet'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Phrases Buttons Grid */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none"
            >
              {AUTHENTIC_VOICE_PHRASES.map(phrase => {
                const isPlaying = playingId === phrase.id;
                return (
                  <button
                    key={phrase.id}
                    onClick={() => handlePhraseClick(phrase)}
                    disabled={disabled}
                    className={`relative group shrink-0 px-3 py-1.5 rounded-xl font-serif-tavla text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPlaying
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105 ring-2 ring-amber-300'
                        : 'bg-white/[0.06] hover:bg-amber-500/20 text-[#fef3c7] hover:text-amber-200 border-white/10 hover:border-amber-400/50'
                    }`}
                    title={`"${phrase.phrase}" ifadesini seslendir`}
                  >
                    {/* Glass sheen */}
                    <span className="absolute inset-x-2 top-0.5 h-[30%] rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

                    <span className="text-sm shrink-0">{phrase.emoji}</span>
                    <span className="whitespace-nowrap tracking-tight">
                      {phrase.label}
                    </span>

                    {isPlaying ? (
                      <span className="flex items-center gap-0.5 ml-0.5">
                        <span className="w-1 h-3 bg-stone-950 rounded-full animate-bounce" />
                        <span className="w-1 h-2 bg-stone-950 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1 h-3.5 bg-stone-950 rounded-full animate-bounce [animation-delay:0.3s]" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400/50 group-hover:text-amber-300 transition-colors ml-0.5">
                        🔊
                      </span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
