'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '@/components/tavla/TopBar';
import { KahvehaneLobby, OPPONENTS } from '@/components/tavla/KahvehaneLobby';
import { LobbyBottomNav } from '@/components/tavla/LobbyBottomNav';
import type { LobbyRoom } from '@/components/tavla/LobbyRooms';
import { TavlaBoard } from '@/components/tavla/TavlaBoard';
import { RewardedAdModal } from '@/components/tavla/RewardedAdModal';
import { AdMobInterstitialModal } from '@/components/tavla/AdMobInterstitialModal';
import { StatisticsModal } from '@/components/tavla/StatisticsModal';
import { AudioSettingsModal } from '@/components/tavla/AudioSettingsModal';
import { ProfileCustomizationModal } from '@/components/tavla/ProfileCustomizationModal';
import { BoardStoreModal } from '@/components/tavla/BoardStoreModal';
import { VictoryModal } from '@/components/tavla/VictoryModal';
import { LeaderboardModal } from '@/components/tavla/LeaderboardModal';
import { PlayerProfileModal } from '@/components/tavla/PlayerProfileModal';
import { cloudflareStorage } from '@/lib/cloudflare/storage';
import { soundEffects } from '@/lib/audio/soundEffects';
import { applyLiteMode, getLiteMode } from '@/lib/perfMode';
import { Opponent, GameMode } from '@/lib/tavla/types';
import { AdRewardType, admobService } from '@/lib/admob/admobService';
import { LeaderboardPlayer } from '@/app/api/leaderboard/route';

export default function Home() {
  // Idiomatic React external store synchronization ensuring zero SSR hydration mismatch
  const profile = useSyncExternalStore(
    cloudflareStorage.subscribe.bind(cloudflareStorage),
    cloudflareStorage.getSnapshot.bind(cloudflareStorage),
    cloudflareStorage.getServerSnapshot.bind(cloudflareStorage)
  );

  const [viewState, setViewState] = useState<'lobby' | 'game'>('lobby');
  const [lobbyTab, setLobbyTab] = useState<'opponents' | 'venues'>('opponents');
  const [lobbyRoom, setLobbyRoom] = useState<LobbyRoom>('oyna');
  const [activeOpponent, setActiveOpponent] = useState<Opponent>(OPPONENTS[0]);
  const [activeGameMode, setActiveGameMode] = useState<GameMode>('ai');

  // Modals
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [inspectedPlayer, setInspectedPlayer] = useState<LeaderboardPlayer | Opponent | null>(null);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState<boolean>(false);
  const [rewardModalType, setRewardModalType] = useState<AdRewardType>('coins');
  const [isInterstitialOpen, setIsInterstitialOpen] = useState<boolean>(false);
  const [isOutOfEnergyModalOpen, setIsOutOfEnergyModalOpen] = useState<boolean>(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState<boolean>(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState<boolean>(false);
  const [isBoardStoreOpen, setIsBoardStoreOpen] = useState<boolean>(false);
  const [victoryState, setVictoryState] = useState<{
    isOpen: boolean;
    won: boolean;
    isMars: boolean;
    score: number;
  }>({
    isOpen: false,
    won: false,
    isMars: false,
    score: 0,
  });

  // Cooldown status
  const [cooldown, setCooldown] = useState<{
    eligible: boolean;
    remainingSeconds: number;
    reason: string;
    dailyRemaining?: number;
  }>({
    eligible: true,
    remainingSeconds: 0,
    reason: 'İkram vakti hazır!',
    dailyRemaining: 8,
  });

  // Start authentic Turkish coffeehouse ambience on first interaction & refresh cooldown timer periodically
  useEffect(() => {
    applyLiteMode(getLiteMode());
    admobService.initialize();
    admobService.prepareRewardVideo();

    const handleFirstGesture = () => {
      soundEffects.startAmbientAmbience();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    const interval = setInterval(() => {
      // Her saniye körü körüne render yapma: değişmediyse state'e dokunma (kasma önler)
      setCooldown(prev => {
        const next = cloudflareStorage.canWatchRewardedAd();
        if (
          prev.eligible === next.eligible &&
          prev.remainingSeconds === next.remainingSeconds &&
          prev.dailyRemaining === next.dailyRemaining
        ) {
          return prev;
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  const handleOpenRewardedAd = (type: AdRewardType = 'coins') => {
    setRewardModalType(type);
    setIsRewardedAdOpen(true);
  };

  const handleStartGame = (opponent: Opponent, mode: GameMode) => {
    if (profile.energy <= 0) {
      soundEffects.playAuthenticTeaClink();
      setIsOutOfEnergyModalOpen(true);
      return;
    }

    cloudflareStorage.consumeEnergy(1);
    soundEffects.playDiceCupShake();
    setActiveOpponent(opponent);
    setActiveGameMode(mode);
    setViewState('game');
  };

  const handleGameOver = (res: { won: boolean; isMars: boolean; score: number }) => {
    admobService.recordMatchFinished();
    setVictoryState({
      isOpen: true,
      won: res.won,
      isMars: res.isMars,
      score: res.score,
    });
  };

  const handleRewardClaimed = (type: AdRewardType) => {
    cloudflareStorage.claimAdReward(type);
    setCooldown(cloudflareStorage.canWatchRewardedAd());
  };

  const handleRematch = () => {
    setVictoryState(prev => ({ ...prev, isOpen: false }));

    void showInterstitialIfDue();

    if (profile.energy <= 0) {
      setIsOutOfEnergyModalOpen(true);
      setViewState('lobby');
      return;
    }

    cloudflareStorage.consumeEnergy(1);
    setViewState('lobby');
    setTimeout(() => {
      setViewState('game');
    }, 50);
  };

  const handleGoLobby = () => {
    setVictoryState(prev => ({ ...prev, isOpen: false }));

    void showInterstitialIfDue();

    setViewState('lobby');
  };

  // 2 maçta bir geçiş reklamı: native varsa GERÇEK reklam, yoksa uygulama-içi sponsor kartı.
  // Her iki durumda da sayaç sıfırlanır (üst üste reklam yok — ban koruması).
  const showInterstitialIfDue = async () => {
    if (!admobService.shouldShowInterstitial()) return;
    admobService.resetInterstitialCounter();
    if (admobService.isNativeAdMobAvailable()) {
      await admobService.showInterstitialNative();
      return;
    }
    setIsInterstitialOpen(true);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#140803] via-[#0d0402] to-[#1a0a04] text-amber-300 font-serif-tavla">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl animate-bounce">🎲</span>
          <span className="text-base tracking-widest uppercase font-bold">Tavla Tahtası Kuruluyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full max-w-full flex flex-col bg-gradient-to-b from-[#140803] via-[#1a0b05] to-[#0c0402] text-[#fef3c7] overflow-x-hidden"
    >
      {/* Ultra-Modern Water-Drop Bubble Top Bar - Visible in Lobby */}
      {viewState === 'lobby' && (
        <TopBar
          onGoLobby={() => {
            handleGoLobby();
            setLobbyTab('opponents');
          }}
          onOpenVenues={() => {
            setViewState('lobby');
            setLobbyTab('venues');
          }}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenProfile={() => {
            setInspectedPlayer(null);
            setIsProfileModalOpen(true);
          }}
          onOpenRewardedAd={handleOpenRewardedAd}
          onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
          onOpenCustomization={() => setIsCustomizationOpen(true)}
          onOpenBoardStore={() => setIsBoardStoreOpen(true)}
          userCoins={profile.coins}
          userEnergy={profile.energy}
          maxEnergy={profile.maxEnergy}
          rewardEligible={cooldown.eligible}
          rewardRemainingSeconds={cooldown.remainingSeconds}
          userAvatar={profile.avatar}
          userFrameId={profile.frameId}
        />
      )}

      {/* Main Content Area: Responsive Viewport in Game Mode */}
      <main
        className={`w-full max-w-full flex-1 flex flex-col justify-start items-center overflow-x-hidden ${
          viewState === 'game' ? 'min-h-[100dvh] h-auto p-1 sm:p-2 overflow-y-auto' : 'py-2 sm:py-4 pb-24'
        }`}
      >
        {viewState === 'lobby' ? (
          <KahvehaneLobby
            userProfile={profile}
            activeTab={lobbyTab}
            room={lobbyRoom}
            onTabChange={setLobbyTab}
            onStartGame={handleStartGame}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenProfile={() => {
              setInspectedPlayer(null);
              setIsProfileModalOpen(true);
            }}
            onInspectPlayer={(opp) => {
              setInspectedPlayer(opp);
              setIsProfileModalOpen(true);
            }}
            onOpenRewardedAd={handleOpenRewardedAd}
            onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
            onOpenCustomization={() => setIsCustomizationOpen(true)}
            onOpenBoardStore={() => setIsBoardStoreOpen(true)}
            rewardCooldown={cooldown}
          />
        ) : (
          <TavlaBoard
            opponent={activeOpponent}
            gameMode={activeGameMode}
            userProfile={profile}
            onGameOver={handleGameOver}
            onBackToLobby={handleGoLobby}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenProfile={() => {
              setInspectedPlayer(null);
              setIsProfileModalOpen(true);
            }}
            onInspectPlayer={(p) => {
              setInspectedPlayer(p);
              setIsProfileModalOpen(true);
            }}
            onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
            onOpenCustomization={() => setIsCustomizationOpen(true)}
            onOpenBoardStore={() => setIsBoardStoreOpen(true)}
          />
        )}
      </main>

      {/* Alt bar odaları (sadece lobide) */}
      {viewState === 'lobby' && (
        <LobbyBottomNav room={lobbyRoom} onChange={setLobbyRoom} />
      )}

      {/* Modals */}
      <PlayerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUserProfile={profile}
        inspectedPlayer={inspectedPlayer}
        onChallengePlayer={(playerName) => {
          const matched = OPPONENTS.find(o => o.name.toLowerCase().includes(playerName.toLowerCase())) || OPPONENTS[0];
          handleStartGame(matched, 'ai');
        }}
        onOpenCustomization={() => setIsCustomizationOpen(true)}
      />

      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        onRewardClaimed={handleRewardClaimed}
        userProfile={profile}
        cooldownStatus={cooldown}
        initialRewardType={rewardModalType}
      />

      <AdMobInterstitialModal
        isOpen={isInterstitialOpen}
        onClose={() => setIsInterstitialOpen(false)}
      />

      {/* Out of Energy (Çay/Can Bitti) Modal Prompt */}
      <AnimatePresence>
        {isOutOfEnergyModalOpen && (
          <div
            onClick={() => setIsOutOfEnergyModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl"
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#221108] via-[#160b05] to-[#0c0402] border-2 border-rose-500/50 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(244,63,94,0.3)] overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-3xl mx-auto mb-3 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-bounce">
                ☕
              </div>

              <span className="text-[10px] uppercase font-black tracking-widest text-rose-300 font-serif-tavla">
                Masa Canınız (Enerji) Tükendi
              </span>

              <h3 className="font-serif-tavla text-xl sm:text-2xl font-black text-white mt-1 mb-2">
                Çaysız Tavla Oynanmaz!
              </h3>

              <p className="text-xs text-amber-100/80 leading-relaxed mb-5">
                Kahvehanede masaya oturmak için 1 bardak demli çay (can) gerekir.
                Kısa bir sponsor video reklamı izleyerek demliğinizi <strong>hemen (5/5 Tam Can)</strong> tazeleyin veya 10 dakika demlenmesini bekleyin.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setIsOutOfEnergyModalOpen(false);
                    handleOpenRewardedAd('energy');
                  }}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif-tavla font-black text-xs sm:text-sm tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-300 shadow-amber-500/30"
                >
                  <span>📺</span>
                  <span>VİDEO İZLE &amp; HEMEN CANI (5/5) AL</span>
                </button>

                <button
                  onClick={() => setIsOutOfEnergyModalOpen(false)}
                  className="w-full py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-amber-200/80 hover:text-white font-serif-tavla text-xs border border-white/10 transition-colors"
                >
                  Bekle &amp; Lobiye Dön
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        userProfile={profile}
        onInspectPlayer={(player) => {
          setInspectedPlayer(player);
          setIsProfileModalOpen(true);
        }}
      />

      <StatisticsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        userProfile={profile}
      />

      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
      />

      <ProfileCustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        userProfile={profile}
      />

      <BoardStoreModal
        isOpen={isBoardStoreOpen}
        onClose={() => setIsBoardStoreOpen(false)}
        userProfile={profile}
        onOpenRewardedAd={() => handleOpenRewardedAd('coins')}
      />

      <VictoryModal
        isOpen={victoryState.isOpen}
        won={victoryState.won}
        isMars={victoryState.isMars}
        score={victoryState.score}
        opponent={activeOpponent}
        isBlitz={activeGameMode === 'blitz'}
        onRematch={handleRematch}
        onLobby={handleGoLobby}
        onOpenRewardedAd={handleOpenRewardedAd}
      />
    </div>
  );
}
