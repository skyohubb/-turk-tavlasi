'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '@/lib/cloudflare/storage';
import { SafeImage } from './SafeImage';
import { AdMobBanner } from './AdMobBanner';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stats = userProfile.stats;
  const total = stats.matchesPlayed;
  const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
  const marsRate = stats.wins > 0 ? Math.round((stats.marsWins / stats.wins) * 100) : 0;

  // Dice frequencies list sorted by count
  const diceEntries = Object.entries(stats.diceRollFrequencies || {}).sort(
    (a, b) => b[1] - a[1]
  );

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
          className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#1f1008] via-[#150a04] to-[#0c0502] border-2 border-amber-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.2)] p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col"
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
          <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-3.5 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow flex items-center justify-center text-lg">
                📊
              </div>
              <div>
                <h2 className="font-serif-tavla text-base sm:text-lg font-bold text-[#fef3c7]">
                  Usta Tavla Sicili &amp; İstatistik Paneli
                </h2>
                <p className="text-xs text-amber-200/60">
                  Resmi maç geçmişi, mars oranları ve zar bereket kayıtları
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 hover:text-white border border-rose-400/50 text-xs font-serif-tavla font-bold flex items-center gap-1.5 transition-all shadow active:scale-95"
              title="Kapat"
            >
              <span className="text-sm">✕</span>
              <span>Kapat</span>
            </button>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto pr-1 space-y-4">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center shadow-inner">
                <span className="text-[10px] text-amber-200/60 uppercase font-bold block">
                  Toplam Maç
                </span>
                <span className="font-serif-tavla text-xl font-bold text-[#fef3c7] tabular-nums">
                  {total}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center shadow-inner">
                <span className="text-[10px] text-amber-200/60 uppercase font-bold block">
                  Galibiyet Oranı
                </span>
                <span className="font-serif-tavla text-xl font-bold text-[#10b981] tabular-nums">
                  %{winRate}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center shadow-inner">
                <span className="text-[10px] text-amber-200/60 uppercase font-bold block">
                  Kazanılan Mars
                </span>
                <span className="font-serif-tavla text-xl font-bold text-[#fbbf24] tabular-nums">
                  {stats.marsWins}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center shadow-inner">
                <span className="text-[10px] text-amber-200/60 uppercase font-bold block">
                  Mars Oranı
                </span>
                <span className="font-serif-tavla text-xl font-bold text-[#f59e0b] tabular-nums">
                  %{marsRate}
                </span>
              </div>
            </div>

            {/* Wins vs Losses Breakdown */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-[#10b981]">{stats.wins} Galibiyet</span>
                <span className="text-amber-200/60">{stats.losses} Mağlubiyet</span>
              </div>
              <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden flex border border-white/10">
                <div
                  style={{ width: `${winRate}%` }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-500"
                />
                <div
                  style={{ width: `${100 - winRate}%` }}
                  className="bg-gradient-to-r from-rose-700 to-rose-500 h-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Google AdMob Banner between Win Rate & Dice Stats */}
            <AdMobBanner format="banner" initialCreativeIndex={3} className="shadow-lg border-amber-500/30" />

            {/* Dice Callout Frequencies (Tavla Nükteleri) */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <h3 className="font-serif-tavla text-xs font-bold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
                <span>🎲</span>
                <span>Zar İstatistikleri &amp; Bereket Dağılımı</span>
              </h3>
              {diceEntries.length === 0 ? (
                <p className="text-xs text-amber-200/50 italic text-center py-2">
                  Henüz zar atılmadı. Birkaç maç yaptıktan sonra zarlarınız burada listelenir.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {diceEntries.slice(0, 6).map(([zarKey, count]) => (
                    <div
                      key={zarKey}
                      className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-between text-xs"
                    >
                      <span className="font-serif-tavla font-semibold text-[#fbbf24]">
                        {zarKey === '6-6'
                          ? 'Düşeş (6-6)'
                          : zarKey === '5-3'
                          ? 'Penc-ü Se (5-3)'
                          : zarKey === '4-4'
                          ? 'Dört Cihar (4-4)'
                          : zarKey === '1-1'
                          ? 'Hep Yek (1-1)'
                          : `${zarKey}`}
                      </span>
                      <span className="text-[#fef3c7] font-bold tabular-nums">
                        {count} kez
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cloud Sync Status */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-amber-200/70">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Bulut Senkronizasyonu: Çevrimiçi &amp; Güvenli</span>
              </span>
              <span className="text-[#10b981] font-semibold">● Senkronize</span>
            </div>

            {/* AdMob Sponsor Dock Strip */}
            <AdMobBanner format="dock_strip" className="mt-2 shadow-none border-amber-500/20" />
          </div>

          {/* Footer Close Button */}
          <div className="relative z-10 pt-3 border-t border-white/[0.08] mt-3 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-amber-200 hover:text-white border border-white/15 text-xs font-serif-tavla font-bold transition-all active:scale-95"
            >
              ✕ Pencereyi Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
