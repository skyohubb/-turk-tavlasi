'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdMobCreative, admobService } from '@/lib/admob/admobService';
import { SafeImage } from './SafeImage';
import { soundEffects } from '@/lib/audio/soundEffects';

interface AdMobInterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdMobInterstitialContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [creative] = useState<AdMobCreative>(() => admobService.getRandomCreative());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Escape key handler when canSkip is true
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canSkip) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSkip, onClose]);

  const handleClose = () => {
    soundEffects.playCheckerSlide();
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        onClick={() => {
          if (canSkip) handleClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-3xl"
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#211108] via-[#160b05] to-[#0c0502] border-2 border-amber-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.25)] overflow-x-hidden flex flex-col"
        >
          {/* Header Bar */}
          <div className="p-3 sm:p-4 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-400/40">
                Sponsorlu İçerik
              </span>
              <span className="text-xs text-amber-200/60 hidden sm:inline">
                Özel Tanıtım
              </span>
            </div>

            {canSkip ? (
              <button
                onClick={handleClose}
                className="px-4 py-1.5 rounded-full bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 hover:text-white border border-rose-400/50 text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 shadow active:scale-95 animate-pulse"
              >
                <span>✕</span>
                <span>Reklamı Kapat</span>
              </button>
            ) : (
              <div className="px-3 py-1 rounded-full bg-white/[0.08] text-amber-200/80 text-xs font-bold font-mono border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Geçmek için: {countdown}s</span>
              </div>
            )}
          </div>

          {/* Ad Media Showcase */}
          <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-black flex items-center justify-center">
            <SafeImage
              src={creative.bannerImage}
              alt={creative.sponsorName}
              className="w-full h-full object-cover opacity-85"
              fallbackIcon={creative.icon}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#160b05] via-transparent to-black/50" />

            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 backdrop-blur-md flex items-center justify-center text-2xl shadow-lg shrink-0">
                {creative.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-amber-300">
                  {creative.sponsorName}
                </span>
                <h3 className="font-serif-tavla font-bold text-base sm:text-lg text-white leading-tight truncate">
                  {creative.headline}
                </h3>
              </div>
            </div>
          </div>

          {/* Ad Body Content */}
          <div className="p-4 sm:p-6 space-y-3">
            <p className="text-xs sm:text-sm text-amber-100/85 leading-relaxed">
              {creative.tagline}
            </p>

            <div className="flex items-center justify-between text-xs text-amber-200/70 pt-1 border-t border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">★ {creative.rating}</span>
                <span>·</span>
                <span>{creative.category}</span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-medium">
                Sponsor Yayını
              </span>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={!canSkip}
                className={`flex-1 py-2.5 rounded-full font-serif-tavla text-xs font-bold transition-all ${
                  canSkip
                    ? 'bg-white/[0.08] hover:bg-white/[0.16] text-amber-200 hover:text-white border border-white/15'
                    : 'bg-white/[0.03] text-white/30 border border-white/5 cursor-not-allowed'
                }`}
              >
                {canSkip ? '✕ Oyuna Devam Et' : `Lütfen Bekleyin (${countdown}s)`}
              </button>

              <button
                onClick={() => {
                  handleClose();
                }}
                className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif-tavla font-black text-xs sm:text-sm tracking-wider shadow-lg hover:shadow-amber-500/40 transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-300"
              >
                <span>{creative.ctaText}</span>
                <span className="text-xs">↗</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return <AdMobInterstitialContent onClose={onClose} />;
};
