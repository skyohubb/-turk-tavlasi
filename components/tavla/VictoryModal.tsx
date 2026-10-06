'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Opponent } from '@/lib/tavla/types';
import { AdMobBanner } from './AdMobBanner';
import { soundEffects } from '@/lib/audio/soundEffects';

interface VictoryModalProps {
  isOpen: boolean;
  won: boolean;
  isMars: boolean;
  score: number;
  opponent: Opponent;
  isBlitz?: boolean;
  onRematch: () => void;
  onLobby: () => void;
  onOpenRewardedAd?: (type?: 'coins' | 'energy') => void;
}

const VictoryModalContent: React.FC<Omit<VictoryModalProps, 'isOpen'>> = ({
  won,
  isMars,
  opponent,
  isBlitz = false,
  onRematch,
  onLobby,
  onOpenRewardedAd,
}) => {
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(false);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onLobby();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLobby]);

  const coinsWon = isBlitz
    ? won
      ? isMars
        ? 1000
        : 600
      : 120
    : won
    ? isMars
      ? 500
      : 250
    : 50;

  const handleWatchBonusAd = () => {
    if (onOpenRewardedAd) {
      setBonusClaimed(true);
      soundEffects.playAuthenticTeaClink();
      onOpenRewardedAd('coins');
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={onLobby}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl"
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#21120a] via-[#160b05] to-[#100703] border-2 border-amber-400/40 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.25)] p-5 sm:p-7 text-center relative overflow-x-hidden flex flex-col"
        >
          {/* Decorative Sparks / Halo */}
          <div
            className={`absolute -top-16 -left-16 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
              won ? 'bg-amber-400/30' : 'bg-rose-500/15'
            }`}
          />
          <div
            className={`absolute -bottom-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
              won ? 'bg-emerald-400/25' : 'bg-rose-500/15'
            }`}
          />

          {/* Trophy / Emblem */}
          <div className="text-5xl sm:text-6xl mb-2 animate-bounce">
            {won ? (isMars ? '👑' : '🏆') : '☕'}
          </div>

          {/* Title */}
          {isBlitz && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/25 border border-rose-400/50 text-rose-300 text-xs font-bold mb-2 animate-pulse mx-auto">
              <span>⚡</span>
              <span>HIZLI MAÇ (BLITZ) · EKSTRA AKÇE BONUSU</span>
            </div>
          )}

          <span className="text-xs uppercase tracking-widest font-black text-amber-400 mb-1 block font-serif-tavla">
            {won ? (isMars ? 'EFSANEVİ MARS ZAFERİ' : 'MAÇ KAZANILDI') : 'TECRÜBE KAZANILDI'}
          </span>

          <h2 className="font-serif-tavla text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">
            {won ? (isMars ? 'MARS ETTİNİZ!' : 'TEBRİKLER!') : (isMars ? 'MARS OLDUNUZ!' : 'MAĞLUBİYET')}
          </h2>

          <p className="text-xs text-amber-100/80 mb-4 px-2 leading-relaxed">
            {won
              ? isMars
                ? `${opponent.name} tek bir pul bile toplayamadan tahtayı süpürdünüz! Çifte puan ve ${isBlitz ? '1000' : '500'} altın akçe kazandınız.`
                : `${opponent.name} karşısında maçı ustalıkla tamamladınız.`
              : `${opponent.name} bu elde zarları daha iyi değerlendirdi. Sıradaki elde rövanşı alabilirsiniz.`}
          </p>

          {/* Rewards / Rating Summary in Glassmorphic Capsule */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] mb-4 backdrop-blur-xl">
            <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
              <span className="text-[10px] text-amber-200/60 uppercase font-bold block mb-0.5">
                Akçe Kazancı {isBlitz && '⚡'}
              </span>
              <span className="font-serif-tavla font-black text-lg sm:text-xl text-amber-300 tabular-nums">
                +{coinsWon} 🪙
              </span>
            </div>
            <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
              <span className="text-[10px] text-amber-200/60 uppercase font-bold block mb-0.5">
                Reyting Değişimi
              </span>
              <span
                className={`font-serif-tavla font-black text-lg sm:text-xl tabular-nums ${
                  won ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {won ? (isMars ? '+32 P' : '+20 P') : (isMars ? '-24 P' : '-15 P')}
              </span>
            </div>
          </div>

          {/* AdMob Rewarded Bonus Button */}
          {onOpenRewardedAd && !bonusClaimed && (
            <button
              onClick={handleWatchBonusAd}
              className="relative group w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-400/30 to-amber-600/25 hover:from-amber-500/40 hover:to-amber-600/40 border border-amber-400/60 text-amber-200 hover:text-white font-serif-tavla font-bold text-xs transition-all shadow mb-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-base animate-pulse">🎁</span>
                <div className="text-left">
                  <div className="text-white font-black text-xs">Zafer İkramı: +500 Ekstra Akçe</div>
                  <div className="text-[10px] text-amber-300/80">Kısa sponsor videosu izleyin</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] uppercase shadow">
                İzle &amp; Al
              </span>
            </button>
          )}

          {bonusClaimed && (
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-serif-tavla font-bold mb-3">
              ✓ Zafer İkramı Alındı (+500 Akçe)
            </div>
          )}

          {/* Actions with Water-Drop Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onRematch}
              className="relative group w-full py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif-tavla font-black text-xs sm:text-sm tracking-wider shadow-[0_8px_25px_rgba(245,158,11,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-300"
            >
              <span className="absolute inset-x-4 top-1 h-[30%] rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
              <span>🔄</span>
              <span>RÖVANŞ YAP (YENİDEN OYNA)</span>
            </button>

            <button
              onClick={onLobby}
              className="relative group w-full py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-amber-200/80 hover:text-white font-serif-tavla text-xs border border-white/10 transition-colors"
            >
              Lobiye &amp; Masalara Dön
            </button>
          </div>

          {/* AdMob Sponsor Mini Dock Strip */}
          <div className="mt-3">
            <AdMobBanner format="dock_strip" className="shadow-none border-amber-500/20" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const VictoryModal: React.FC<VictoryModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <VictoryModalContent {...props} />;
};
