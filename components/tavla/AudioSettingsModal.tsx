'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '@/lib/audio/soundEffects';
import { SafeImage } from './SafeImage';
import { AdMobBanner } from './AdMobBanner';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEffects.getIsMuted());
  const [ambientVol, setAmbientVol] = useState<number>(() => soundEffects.getAmbientVolume());
  const [sfxVol, setSfxVol] = useState<number>(() => soundEffects.getSfxVolume());

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEffects.startAmbientAmbience();
    }
  };

  const handleAmbientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmbientVol(val);
    soundEffects.setAmbientVolume(val);
    if (!isMuted && val > 0) {
      soundEffects.startAmbientAmbience();
    }
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundEffects.setSfxVolume(val);
    soundEffects.playCheckerDrop();
  };

  const testTea = () => {
    soundEffects.playAuthenticTeaClink();
  };

  const testDice = () => {
    soundEffects.playDiceRoll();
  };

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl"
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1f1008] via-[#160b05] to-[#0c0502] border-2 border-amber-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.2)] p-5 sm:p-6 overflow-x-hidden flex flex-col"
        >
          {/* Authentic Wood Inlay Texture Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
            <SafeImage
              src="/images/ottoman_wood_inlay_texture.jpg"
              alt="Ahşap Doku"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Brass Corner Brackets */}
          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/70 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/70 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/70 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/70 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📻</span>
              <div>
                <h2 className="font-serif-tavla text-base sm:text-lg font-bold text-[#fef3c7]">
                  Kahvehane Ses &amp; Müzik
                </h2>
                <p className="text-[11px] text-amber-200/60">
                  Otantik kıraathane fon sesleri ve tavla vuruşları
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 hover:text-white border border-rose-400/50 text-xs font-serif-tavla font-bold flex items-center gap-1.5 transition-all shadow active:scale-95"
              title="Kapat"
            >
              <span className="text-sm">✕</span>
              <span>Kapat</span>
            </button>
          </div>

          <div className="relative z-10 space-y-4">
            {/* Master Mute Toggle */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="font-serif-tavla text-sm font-bold text-[#fef3c7]">
                  Tüm Sesleri Sustur
                </div>
                <div className="text-xs text-amber-200/60">
                  Oyun içi ve ortam seslerini kapatır
                </div>
              </div>
              <button
                onClick={handleToggleMute}
                className={`px-4 py-1.5 rounded-full font-serif-tavla text-xs font-bold transition-all border shadow ${
                  isMuted
                    ? 'bg-rose-500/25 border-rose-400 text-rose-300'
                    : 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                }`}
              >
                {isMuted ? '🔇 KAPALI' : '🔊 AÇIK'}
              </button>
            </div>

            {/* Ambient Kahvehane Soundscape Slider */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span>☕</span>
                  <span className="font-serif-tavla font-bold text-[#fef3c7]">
                    Kahvehane Ambiyansı &amp; Fon Müziği
                  </span>
                </div>
                <span className="text-amber-300 font-mono font-bold">
                  %{Math.round(ambientVol * 100)}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/60 leading-relaxed">
                Hafif ney/ud tınıları, çay bardağı şıngırtısı, uzaktaki tavla sesleri ve kahvehane uğultusu.
              </p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVol}
                onChange={handleAmbientChange}
                disabled={isMuted}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Game Sound Effects Slider */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span>🎲</span>
                  <span className="font-serif-tavla font-bold text-[#fef3c7]">
                    Tavla &amp; Zar Vuruş Efektleri
                  </span>
                </div>
                <span className="text-amber-300 font-mono font-bold">
                  %{Math.round(sfxVol * 100)}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/60 leading-relaxed">
                Kemik zar yuvarlanması, tahtaya tok pul vuruşu, pul kırma ve kapı sesleri.
              </p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVol}
                onChange={handleSfxChange}
                disabled={isMuted}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Quick Test Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={testTea}
                disabled={isMuted}
                className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-amber-200 text-xs font-serif-tavla border border-white/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <span>☕ Çay Kaşığı</span>
              </button>
              <button
                onClick={testDice}
                disabled={isMuted}
                className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-amber-200 text-xs font-serif-tavla border border-white/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <span>🎲 Ahşap Zar</span>
              </button>
            </div>
          </div>

          {/* AdMob Sponsor Dock Strip */}
          <div className="pt-2">
            <AdMobBanner format="dock_strip" className="shadow-none border-amber-500/20" />
          </div>

          {/* Footer Close Button */}
          <div className="relative z-10 pt-3 border-t border-white/[0.08] mt-4 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-amber-200 hover:text-white border border-white/15 text-xs font-serif-tavla font-bold transition-all active:scale-95"
            >
              ✕ Tamam &amp; Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
