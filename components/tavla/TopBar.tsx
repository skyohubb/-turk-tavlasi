'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import { formatCoins, formatCountdown } from '@/lib/format';

interface TopBarProps {
  onGoLobby: () => void;
  onOpenVenues?: () => void;
  onOpenStats: () => void;
  onOpenLeaderboard?: () => void;
  onOpenProfile?: () => void;
  onOpenRewardedAd: (type?: 'coins' | 'energy' | 'reroll' | 'time') => void;
  onOpenAudioSettings?: () => void;
  onOpenCustomization?: () => void;
  onOpenBoardStore?: () => void;
  userCoins: number;
  userEnergy?: number;
  maxEnergy?: number;
  rewardEligible?: boolean;
  rewardRemainingSeconds?: number;
  userAvatar?: string;
  userFrameId?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onGoLobby,
  onOpenVenues,
  onOpenStats,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenRewardedAd,
  onOpenAudioSettings,
  onOpenCustomization,
  onOpenBoardStore,
  userCoins,
  userEnergy = 5,
  maxEnergy = 5,
  rewardEligible = true,
  rewardRemainingSeconds = 0,
  userAvatar,
  userFrameId,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = formatCountdown;

  // Dar ekranda taşmayı önlemek için büyük bakiyeleri kısalt (12500 → 12,5K)

  const handleMenuAction = (action?: () => void) => {
    setIsMobileMenuOpen(false);
    if (action) action();
  };

  return (
    <>
      <header className="w-full sticky top-0 z-40 px-2 sm:px-4 lg:px-6 py-2 bg-[#140904]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-x-clip">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-3 min-w-0">
          {/* Zone 1: Modern Brand Wordmark */}
          <button
            onClick={onGoLobby}
            className="relative group flex items-center gap-1 sm:gap-2.5 px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.12] hover:border-amber-400/60 transition-all duration-200 active:scale-95 shrink-0"
          >
            {/* 3D dice icon bubble */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center justify-center shrink-0">
              <span className="text-sm sm:text-base select-none">🎲</span>
            </div>

            <div className="flex flex-col text-left">
              <span className="font-serif-tavla font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-amber-200 via-amber-100 to-amber-400 bg-clip-text text-transparent group-hover:from-white group-hover:to-amber-300 transition-colors">
                DÜŞEŞ
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-amber-300/80 font-semibold -mt-1 hidden xs:block">
                TÜRK TAVLASI
              </span>
            </div>
          </button>

          {/* Zone 2: Desktop Navigation Buttons (Full on xl, compact on lg) */}
          <nav className="hidden xl:flex items-center gap-2">
            {/* Masalar Bubble Button */}
            <button
              onClick={onOpenVenues || onGoLobby}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-emerald-500/20 border border-white/[0.12] hover:border-emerald-400/50 transition-all flex items-center gap-1.5 text-xs font-semibold text-emerald-100 hover:text-emerald-200"
            >
              <span className="text-emerald-400 text-sm">🏟️</span>
              <span>Masalar</span>
            </button>

            {/* Portre Özelleştir Bubble Button */}
            {onOpenCustomization && (
              <button
                onClick={onOpenCustomization}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-cyan-500/20 border border-white/[0.12] hover:border-cyan-400/50 transition-all flex items-center gap-1.5 text-xs font-semibold text-cyan-100 hover:text-cyan-200"
              >
                <span className="text-cyan-300 text-sm">🎭</span>
                <span>Portreler</span>
              </button>
            )}

            {/* Tahta Mağazası Bubble Button */}
            {onOpenBoardStore && (
              <button
                onClick={onOpenBoardStore}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-amber-500/20 border border-white/[0.12] hover:border-amber-400/50 transition-all flex items-center gap-1.5 text-xs font-semibold text-amber-100 hover:text-amber-200"
              >
                <span className="text-amber-400 text-sm">🪵</span>
                <span>Tahta Mağazası</span>
              </button>
            )}

            {/* Dünya Liderlik Tablosu Bubble Button */}
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-amber-500/25 border border-white/[0.12] hover:border-amber-400/60 transition-all flex items-center gap-1.5 text-xs font-semibold text-amber-100 hover:text-amber-200"
              >
                <span className="text-amber-300 text-sm">🏆</span>
                <span>Liderler</span>
              </button>
            )}

            {/* Oyuncu Profili Bubble Button */}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-amber-500/25 border border-white/[0.12] hover:border-amber-400/60 transition-all flex items-center gap-1.5 text-xs font-semibold text-amber-100 hover:text-amber-200"
              >
                <span className="text-amber-400 text-sm">👤</span>
                <span>Profilim</span>
              </button>
            )}

            {/* İstatistik Bubble Button */}
            <button
              onClick={onOpenStats}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-rose-500/20 border border-white/[0.12] hover:border-rose-400/50 transition-all flex items-center gap-1.5 text-xs font-semibold text-rose-100 hover:text-rose-200"
            >
              <span className="text-rose-400 text-sm">📊</span>
              <span>İstatistikler</span>
            </button>

            {/* İkram Bubble Button */}
            <button
              onClick={() => onOpenRewardedAd()}
              className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 text-xs font-semibold ${
                rewardEligible
                  ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 hover:text-white shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'bg-white/[0.04] border-white/10 text-amber-100/60'
              }`}
            >
              <span className={`text-sm ${rewardEligible ? 'animate-bounce text-amber-300' : 'text-amber-400/60'}`}>
                {rewardEligible ? '🎁' : '⏳'}
              </span>
              <span>{rewardEligible ? 'İkram' : formatTime(rewardRemainingSeconds)}</span>
            </button>
          </nav>

          {/* Medium Screen Navigation (md to xl) */}
          <nav className="hidden md:flex xl:hidden items-center gap-1.5">
            <button
              onClick={onOpenVenues || onGoLobby}
              className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-emerald-500/20 border border-white/[0.12] text-xs font-semibold text-emerald-100 flex items-center gap-1"
            >
              <span>🏟️</span>
              <span>Masalar</span>
            </button>
            {onOpenBoardStore && (
              <button
                onClick={onOpenBoardStore}
                className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-amber-500/20 border border-white/[0.12] text-xs font-semibold text-amber-100 flex items-center gap-1"
              >
                <span>🪵</span>
                <span>Mağaza</span>
              </button>
            )}
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-amber-500/25 border border-white/[0.12] text-xs font-semibold text-amber-100 flex items-center gap-1"
              >
                <span>🏆</span>
                <span>Liderler</span>
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 text-xs text-amber-200 font-bold"
            >
              ••• Menü
            </button>
          </nav>

          {/* Zone 3: Actions & Player Capsule (Compact, responsive, zero-overflow) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
            {/* Energy / Can Button */}
            <button
              onClick={() => onOpenRewardedAd('energy')}
              className={`relative px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shrink-0 ${
                userEnergy <= 1
                  ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse'
                  : 'bg-rose-500/15 border-rose-400/35 text-rose-200'
              }`}
              title="Masa Canı (Enerji) - Tıklayarak can doldurun"
            >
              <span className="text-sm">☕</span>
              <span suppressHydrationWarning className="tabular-nums font-black text-rose-100">
                {userEnergy}/{maxEnergy}
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500/40 text-rose-200 border border-rose-400/50 flex items-center justify-center text-[9px] font-black">
                +
              </span>
            </button>

            {/* Sesler Button (Hidden on xs/mobile to prevent overflow, accessible in menu) */}
            {onOpenAudioSettings && (
              <button
                onClick={onOpenAudioSettings}
                className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-white/[0.06] hover:bg-indigo-500/25 border border-white/[0.12] hover:border-indigo-400/50 transition-all items-center gap-1 text-xs font-semibold text-indigo-100"
                title="Sesler & Ambiyans"
              >
                <span className="text-sm">📻</span>
                <span className="hidden lg:inline">Sesler</span>
              </button>
            )}

            {/* Golden Akçe Button */}
            <button
              onClick={() => onOpenRewardedAd('coins')}
              className="relative px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 hover:border-amber-300/70 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold text-amber-200 whitespace-nowrap shrink-0 min-w-0 max-w-[92px] sm:max-w-none"
              title={`Kasa Bakiyesi: ${userCoins} akçe - Tıklayarak akçe kazanın`}
            >
              <span className="text-sm shrink-0">🪙</span>
              <span suppressHydrationWarning className="tabular-nums font-black text-amber-100 truncate">
                {formatCoins(userCoins)}
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500/40 text-amber-200 border border-amber-400/50 flex items-center justify-center text-[9px] font-black">
                +
              </span>
            </button>

            {/* Player Avatar */}
            {onOpenCustomization && (
              <button
                onClick={onOpenCustomization}
                className="relative p-0.5 rounded-full hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Portre & Şahsiyet"
              >
                <PlayerAvatar
                  avatarUrl={userAvatar}
                  frameId={userFrameId}
                  size={32}
                  showBadge={false}
                />
              </button>
            )}

            {/* Mobile / Compact Menu Trigger Button (Visible on screens < xl) */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="xl:hidden p-1.5 sm:p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 text-amber-300 hover:text-white transition-all flex items-center justify-center shrink-0"
              title="Menüyü Aç"
              aria-label="Menü"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE / RESPONSIVE QUICK NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-start sm:pt-16 sm:px-6"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto max-h-[85dvh] overflow-y-auto bg-[#1b0e06] border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col gap-3 text-sm animate-in fade-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header of Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎲</span>
                <span className="font-serif-tavla font-black text-amber-200 text-base">Hızlı Menü</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 gap-2 py-1">
              <button
                onClick={() => handleMenuAction(onOpenVenues || onGoLobby)}
                className="p-3 rounded-2xl bg-white/[0.05] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 flex items-center gap-2.5 text-left transition-colors"
              >
                <span className="text-2xl">🏟️</span>
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm">Masalar</div>
                  <div className="text-[10px] text-amber-200/60">Tarihi Mekanlar</div>
                </div>
              </button>

              {onOpenBoardStore && (
                <button
                  onClick={() => handleMenuAction(onOpenBoardStore)}
                  className="p-3 rounded-2xl bg-white/[0.05] hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 flex items-center gap-2.5 text-left transition-colors"
                >
                  <span className="text-2xl">🪵</span>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Mağaza</div>
                    <div className="text-[10px] text-amber-200/60">Sedef & Ahşap</div>
                  </div>
                </button>
              )}

              {onOpenLeaderboard && (
                <button
                  onClick={() => handleMenuAction(onOpenLeaderboard)}
                  className="p-3 rounded-2xl bg-white/[0.05] hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 flex items-center gap-2.5 text-left transition-colors"
                >
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Liderler</div>
                    <div className="text-[10px] text-amber-200/60">Kahvehane Ligi</div>
                  </div>
                </button>
              )}

              {onOpenProfile && (
                <button
                  onClick={() => handleMenuAction(onOpenProfile)}
                  className="p-3 rounded-2xl bg-white/[0.05] hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 flex items-center gap-2.5 text-left transition-colors"
                >
                  <span className="text-2xl">👤</span>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Profilim</div>
                    <div className="text-[10px] text-amber-200/60">Kariyer & Kupa</div>
                  </div>
                </button>
              )}

              {onOpenCustomization && (
                <button
                  onClick={() => handleMenuAction(onOpenCustomization)}
                  className="p-3 rounded-2xl bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 flex items-center gap-2.5 text-left transition-colors"
                >
                  <span className="text-2xl">🎭</span>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Portreler</div>
                    <div className="text-[10px] text-amber-200/60">Şahsiyet & Çerçeve</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => handleMenuAction(onOpenStats)}
                className="p-3 rounded-2xl bg-white/[0.05] hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/40 flex items-center gap-2.5 text-left transition-colors"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm">İstatistikler</div>
                  <div className="text-[10px] text-amber-200/60">Zar İstatistikleri</div>
                </div>
              </button>

              {onOpenAudioSettings && (
                <button
                  onClick={() => handleMenuAction(onOpenAudioSettings)}
                  className="p-3 rounded-2xl bg-white/[0.05] hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/40 flex items-center gap-2.5 text-left transition-colors"
                >
                  <span className="text-2xl">📻</span>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">Ses & Müzik</div>
                    <div className="text-[10px] text-amber-200/60">Kahvehane Ambiyansı</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => handleMenuAction(() => onOpenRewardedAd())}
                className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 flex items-center gap-2.5 text-left transition-colors"
              >
                <span className="text-2xl">🎁</span>
                <div>
                  <div className="font-bold text-amber-300 text-xs sm:text-sm">Günün İkramı</div>
                  <div className="text-[10px] text-amber-200/70">
                    {rewardEligible ? 'Hemen İzle & Al' : `Süre: ${formatTime(rewardRemainingSeconds)}`}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

