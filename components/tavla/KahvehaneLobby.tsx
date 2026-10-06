'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Opponent, GameMode } from '@/lib/tavla/types';
import { UserProfile } from '@/lib/cloudflare/storage';
import { PlayerAvatar } from './PlayerAvatar';
import { SafeImage } from './SafeImage';
import { AdMobBanner } from './AdMobBanner';
import { soundEffects } from '@/lib/audio/soundEffects';
import { formatLongDuration } from '@/lib/format';
import { MagazaRoom, IkramRoom, LigRoom, ProfilRoom, LobbyRoom } from './LobbyRooms';

interface KahvehaneLobbyProps {
  userProfile: UserProfile;
  activeTab?: 'opponents' | 'venues';
  onTabChange?: (tab: 'opponents' | 'venues') => void;
  onStartGame: (opponent: Opponent, mode: GameMode) => void;
  onOpenStats: () => void;
  onOpenLeaderboard?: () => void;
  onOpenProfile?: () => void;
  onInspectPlayer?: (player: Opponent) => void;
  onOpenRewardedAd: (type?: 'coins' | 'energy' | 'reroll' | 'time') => void;
  onOpenAudioSettings?: () => void;
  onOpenCustomization?: () => void;
  onOpenBoardStore?: () => void;
  rewardCooldown: { eligible: boolean; remainingSeconds: number; reason: string; dailyRemaining?: number };
  room?: LobbyRoom;
}

export const OPPONENTS: Opponent[] = [
  {
    id: 'haci_dayi',
    name: 'Hacı Dayı',
    title: 'Çınaraltı Şampiyonu',
    avatar: '/images/avatar_haci_dayi.jpg',
    difficulty: 'easy',
    catchphrase: '“Attık zarı, aldık marşı! Zarın hakkını bilenle oynarız.”',
    venue: 'Tarihi Çınaraltı Kahvesi',
    rating: 1250,
  },
  {
    id: 'cayci_rustem',
    name: 'Çaycı Rüstem',
    title: 'Tavşan Kanı Dem Ustası',
    avatar: '/images/avatar_cayci_rustem.jpg',
    difficulty: 'medium',
    catchphrase: '“Çayı tazeleyen zarı da tazeler! Çekinme bir kapı da benden sana.”',
    venue: 'Boğaziçi İskele Kahvesi',
    rating: 1390,
  },
  {
    id: 'mahmut_emmi',
    name: 'Mahmut Emmi',
    title: 'Galata Tavla Reisi',
    avatar: '/images/avatar_mahmut_emmi.jpg',
    difficulty: 'medium',
    catchphrase: '“Korkak tavlacı kapı alamaz yeğenim, açık vereni affetmem!”',
    venue: 'Galata Kulesi Tavla Kulübü',
    rating: 1480,
  },
  {
    id: 'genc_emre',
    name: 'Genç Emre',
    title: 'Hızlı Zar Ustası',
    avatar: '/images/avatar_genc_emre.jpg',
    difficulty: 'easy',
    catchphrase: '“Hızlı düşünen masayı toplar! Gençlik ateşiyle zarları sallarız.”',
    venue: 'Boğaziçi Yalı Bahçesi',
    rating: 1320,
  },
  {
    id: 'muallim_hikmet',
    name: 'Muallim Hikmet Bey',
    title: 'Emekli Edebiyat Muallimi',
    avatar: '/images/avatar_emekli_hoca.jpg',
    difficulty: 'hard',
    catchphrase: '“Severler güzeli penc-ü se... Zarların da bir vezni, bir hikmeti vardır.”',
    venue: 'Sahaflar Kıraathanesi',
    rating: 1610,
  },
  {
    id: 'usta_selim',
    name: 'Usta Selim',
    title: 'Kapalıçarşı Sedefkârı',
    avatar: '/images/avatar_usta_selim.jpg',
    difficulty: 'grandmaster',
    catchphrase: '“Tavla sabır ve hendese işidir. Mars etmek marifet değil, lonca adetidir.”',
    venue: 'Kapalıçarşı Ustalar Loncası',
    rating: 1780,
  },
  {
    id: 'beyoglu_centilmeni',
    name: 'Beyoğlu Centilmeni',
    title: 'İstiklal Duayeni',
    avatar: '/images/avatar_beyoglu_centilmeni.jpg',
    difficulty: 'hard',
    catchphrase: '“Zarafetle kaybedilen oyun, nobranlıkla kazanılan zaferden evladır.”',
    venue: 'Pera Palas Tavla Salonu',
    rating: 1690,
  },
];

export const VENUES = [
  {
    id: 'cinaralti',
    title: 'Tarihi Çınaraltı Kahvesi',
    desc: 'Asırlık çınarın gölgesinde çay kaşığı tıkırtıları ve acemi zarlar.',
    bg: '/images/kahvehane_ambient.jpg',
    tier: 'Acemi & Çırak',
  },
  {
    id: 'galata',
    title: 'Galata Tavla Kulübü',
    desc: 'Haliç rüzgarında çetin kapı mücadeleleri ve usta kalfalar.',
    bg: '/images/tavla_board.jpg',
    tier: 'Kıdemli Kalfa',
  },
  {
    id: 'kapalicarsi',
    title: 'Kapalıçarşı Ustalar Loncası',
    desc: 'Sedef kakma antik tahtalarda mars bahisleri ve efsane üstatlar.',
    bg: '/images/tavla_crest.jpg',
    tier: 'Büyük Usta',
  },
];

export const KahvehaneLobby: React.FC<KahvehaneLobbyProps> = ({
  userProfile,
  activeTab: controlledTab,
  onTabChange,
  onStartGame,
  onOpenStats,
  onOpenLeaderboard,
  onOpenProfile,
  onInspectPlayer,
  onOpenRewardedAd,
  onOpenAudioSettings,
  onOpenCustomization,
  onOpenBoardStore,
  rewardCooldown,
  room = 'oyna',
}) => {
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent>(OPPONENTS[0]);
  const [selectedMode, setSelectedMode] = useState<'ai' | 'blitz'>('ai');
  const [internalTab, setInternalTab] = useState<'opponents' | 'venues'>('opponents');

  const currentTab = controlledTab ?? internalTab;
  const handleTabSwitch = (t: 'opponents' | 'venues') => {
    setInternalTab(t);
    onTabChange?.(t);
  };
  const [isAmbientOn, setIsAmbientOn] = useState<boolean>(() => !soundEffects.getIsMuted());

  const handleToggleAmbient = () => {
    const muted = soundEffects.toggleMute();
    setIsAmbientOn(!muted);
    if (!muted) {
      soundEffects.startAmbientAmbience();
      soundEffects.playAuthenticTeaClink();
    }
  };

  // Format cooldown
  const formatRemainingTime = formatLongDuration;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 px-4 py-3">
      {/* Alt bar odaları: oyna dışındakiler hafif ve tek başına mount olur */}
      {room === 'magaza' && (
        <MagazaRoom
          userProfile={userProfile}
          rewardCooldown={rewardCooldown}
          onOpenRewardedAd={onOpenRewardedAd}
          onOpenLeaderboard={onOpenLeaderboard}
          onOpenProfile={onOpenProfile}
          onOpenStats={onOpenStats}
          onOpenCustomization={onOpenCustomization}
          onOpenBoardStore={onOpenBoardStore}
          onOpenAudioSettings={onOpenAudioSettings}
        />
      )}
      {room === 'ikram' && (
        <IkramRoom
          userProfile={userProfile}
          rewardCooldown={rewardCooldown}
          onOpenRewardedAd={onOpenRewardedAd}
          onOpenLeaderboard={onOpenLeaderboard}
          onOpenProfile={onOpenProfile}
          onOpenStats={onOpenStats}
          onOpenCustomization={onOpenCustomization}
          onOpenBoardStore={onOpenBoardStore}
          onOpenAudioSettings={onOpenAudioSettings}
        />
      )}
      {room === 'lig' && (
        <LigRoom
          userProfile={userProfile}
          rewardCooldown={rewardCooldown}
          onOpenRewardedAd={onOpenRewardedAd}
          onOpenLeaderboard={onOpenLeaderboard}
          onOpenProfile={onOpenProfile}
          onOpenStats={onOpenStats}
          onOpenCustomization={onOpenCustomization}
          onOpenBoardStore={onOpenBoardStore}
          onOpenAudioSettings={onOpenAudioSettings}
        />
      )}
      {room === 'profil' && (
        <ProfilRoom
          userProfile={userProfile}
          rewardCooldown={rewardCooldown}
          onOpenRewardedAd={onOpenRewardedAd}
          onOpenLeaderboard={onOpenLeaderboard}
          onOpenProfile={onOpenProfile}
          onOpenStats={onOpenStats}
          onOpenCustomization={onOpenCustomization}
          onOpenBoardStore={onOpenBoardStore}
          onOpenAudioSettings={onOpenAudioSettings}
        />
      )}
      {room === 'oyna' && (
      <>
      {/* HERO SECTION: Authentic Old Turkish Coffeehouse Atmosphere */}
      <div className="relative w-full rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.2)] bg-gradient-to-br from-[#1c0e07] via-[#120703] to-[#0a0301]">
        {/* Ambient Backdrop Image with Nostalgic Warm Vignette */}
        <div className="absolute inset-0">
          <SafeImage
            src="/images/antique_kahvehane_nostalgia.jpg"
            alt="Tarihi Osmanlı Kahvehanesi Ambiyansı"
            className="w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105"
            fallbackSrc="/images/kahvehane_ambient.jpg"
            fallbackIcon="🏛️"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100603] via-[#120703]/80 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-t from-amber-500/15 via-transparent to-black/75 pointer-events-none" />
          {/* Subtle warm flickering lantern light overlay */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        </div>

        {/* Brass corner brackets on hero */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400/70 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400/70 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400/70 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400/70 pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl">
            {/* Traditional Ottoman Badge */}
            <div className="relative px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-700/20 border border-amber-400/50 backdrop-blur-xl shadow-inner mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              <span className="text-[11px] uppercase tracking-widest text-amber-200 font-bold font-serif-tavla">
                Asırlık Boğaziçi &amp; Çınaraltı Kıraathanesi
              </span>
            </div>

            <h1 className="font-serif-tavla text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] mb-3">
              Düşeş: Efsanevi Türk Tavlası
            </h1>

            <p className="text-sm sm:text-base text-amber-100/85 leading-relaxed mb-6">
              Tarihi kahvehanelerin ahşap kokusu, ince belli çay tıkırtısı, kandil ışıkları ve 3D zar şovlarıyla donatılmış usta tavlacılar meclisine hoş geldiniz.
            </p>

            {/* Quick Actions with Water Drop Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => onStartGame(selectedOpponent, 'ai')}
                className="relative group px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif-tavla font-black text-sm tracking-wider shadow-[0_10px_30px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border border-amber-300/60"
              >
                <span className="absolute inset-x-4 top-1 h-[30%] rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                <span className="text-base">🎲</span>
                <span>KLASİK MAÇ</span>
              </button>

              <button
                onClick={() => onStartGame(selectedOpponent, 'blitz')}
                className="relative group px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-rose-400 text-white font-serif-tavla font-black text-sm tracking-wider shadow-[0_10px_30px_rgba(244,63,94,0.45)] hover:shadow-[0_12px_40px_rgba(244,63,94,0.65)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border border-rose-400/50"
              >
                <span className="absolute inset-x-4 top-1 h-[30%] rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                <span className="text-base animate-bounce">⚡</span>
                <span>HIZLI MAÇ (BLITZ · 15sn)</span>
                <span className="bg-stone-950/40 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-300/40">
                  +Bonus Akçe 🪙
                </span>
              </button>

              <button
                onClick={() => onStartGame(selectedOpponent, 'local_2p')}
                className="relative group px-4 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-amber-100 hover:text-white font-serif-tavla text-xs sm:text-sm font-semibold border border-white/20 hover:border-amber-400/50 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <span className="text-base">👥</span>
                <span>2 Kişilik</span>
              </button>
            </div>
          </div>

          {/* User Profile Card & Daily Hospitality Widget */}
          <div className="w-full lg:w-80 flex flex-col gap-3">
            {/* Glassmorphic Profile Widget with Walnut Wood Texture */}
            <div className="relative p-4 rounded-3xl overflow-hidden bg-gradient-to-br from-[#24130a]/90 via-[#180c05]/95 to-[#100703]/95 border-2 border-amber-500/30 shadow-[0_12px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              {/* Wood texture background overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
                <SafeImage
                  src="/images/ottoman_wood_inlay_texture.jpg"
                  alt="Ahşap Doku"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Brass corner brackets */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-amber-400/60 pointer-events-none" />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-amber-400/60 pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-amber-400/60 pointer-events-none" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-amber-400/60 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      avatarUrl={userProfile.avatar || '/images/avatar_genc_cirak.jpg'}
                      frameId={userProfile.frameId || 'frame_classic_wood'}
                      size={50}
                      onClick={onOpenCustomization}
                    />
                    <div>
                      <div suppressHydrationWarning className="font-serif-tavla font-bold text-sm text-[#fef3c7]">
                        {userProfile.name}
                      </div>
                      <div suppressHydrationWarning className="text-xs text-amber-400 font-medium">
                        {userProfile.title} (Seviye {userProfile.stats.level})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenProfile && (
                      <button
                        onClick={onOpenProfile}
                        className="relative group px-2.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-semibold transition-all hover:scale-105 shadow-sm"
                        title="Detaylı Profil ve Rozetleri Gör"
                      >
                        <span>👤 Profil</span>
                      </button>
                    )}
                    {onOpenCustomization && (
                      <button
                        onClick={onOpenCustomization}
                        className="relative group px-2.5 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-semibold transition-all hover:scale-105 shadow-sm"
                        title="Portre ve Çerçeve Özelleştir"
                      >
                        <span>🎨</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs py-2 border-y border-white/[0.08]">
                  <div className="bg-black/40 p-1.5 rounded-xl border border-amber-500/20 shadow-inner">
                    <span className="text-amber-200/60 block text-[9px] font-bold uppercase tracking-wider">
                      OSMANLI AKÇESİ
                    </span>
                    <span suppressHydrationWarning className="font-black text-amber-300 tabular-nums text-sm">
                      🪙 {userProfile.coins}
                    </span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded-xl border border-amber-500/20 shadow-inner">
                    <span className="text-amber-200/60 block text-[9px] font-bold uppercase tracking-wider">
                      REYTİNG PUANI
                    </span>
                    <span suppressHydrationWarning className="font-black text-emerald-300 tabular-nums text-sm">
                      ⭐ {userProfile.rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 text-xs text-amber-200/80 font-medium">
                  <span suppressHydrationWarning>Galibiyet: {userProfile.stats.wins}</span>
                  <span suppressHydrationWarning>Mars: {userProfile.stats.marsWins}</span>
                  <span suppressHydrationWarning>Zar Yenileme: {userProfile.reRollCredits}</span>
                </div>
              </div>
            </div>

            {/* Daily Hospitality (Kahvehane İkramı) Card with Dim Lantern Warmth */}
            <div className="relative p-4 rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600/20 via-amber-800/15 to-[#211108]/90 border-2 border-amber-400/35 shadow-[0_12px_30px_rgba(245,158,11,0.2)] backdrop-blur-xl">
              {/* Brass corners */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-amber-400/60 pointer-events-none" />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-amber-400/60 pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-amber-400/60 pointer-events-none" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-amber-400/60 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-pulse">☕</span>
                    <span className="text-xs font-serif-tavla font-bold text-amber-200">
                      Tavşan Kanı Çay &amp; Akçe İkramı
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold text-amber-300 bg-amber-500/25 px-2 py-0.5 rounded-full border border-amber-400/40">
                      Günün İkramı
                    </span>
                    {rewardCooldown.dailyRemaining !== undefined && (
                      <span className="text-[9px] text-amber-200/80 bg-black/40 px-1.5 py-0.5 rounded border border-white/10 font-mono">
                        Kalan: {rewardCooldown.dailyRemaining}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-amber-100/75 mb-3 leading-snug">
                  {rewardCooldown.eligible
                    ? 'Semaver kaynıyor! Kısa bir sponsor video reklamı izleyerek canınızı (5/5) yenileyin veya +500 altın akçe kazanın.'
                    : `Sıcak demlik molası: ${formatRemainingTime(rewardCooldown.remainingSeconds)} sonra yeni ikram hazır.`}
                </p>

                {/* Two Action Buttons: Coins vs Can */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => onOpenRewardedAd('energy')}
                    disabled={!rewardCooldown.eligible}
                    className={`relative group py-2 px-2.5 rounded-2xl text-[11px] font-serif-tavla font-bold transition-all flex items-center justify-center gap-1.5 shadow ${
                      rewardCooldown.eligible
                        ? 'bg-rose-500/25 hover:bg-rose-500/40 text-rose-100 border border-rose-400/50 hover:scale-[1.02] active:scale-95 cursor-pointer'
                        : 'bg-white/[0.04] text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <span>☕</span>
                    <span>Canı Doldur (5/5)</span>
                  </button>

                  <button
                    onClick={() => onOpenRewardedAd('coins')}
                    disabled={!rewardCooldown.eligible}
                    className={`relative group py-2 px-2.5 rounded-2xl text-[11px] font-serif-tavla font-bold transition-all flex items-center justify-center gap-1.5 shadow ${
                      rewardCooldown.eligible
                        ? 'bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-400/50 hover:scale-[1.02] active:scale-95 cursor-pointer'
                        : 'bg-white/[0.04] text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <span>🪙</span>
                    <span>+500 Akçe Al</span>
                  </button>
                </div>

                <button
                  onClick={() => onOpenRewardedAd()}
                  disabled={!rewardCooldown.eligible}
                  className={`relative group w-full py-2 rounded-full text-xs font-serif-tavla font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                    rewardCooldown.eligible
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 cursor-pointer hover:scale-[1.02] active:scale-95 border border-amber-300'
                      : 'bg-white/[0.05] text-amber-300/40 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  <span className="absolute inset-x-4 top-0.5 h-[30%] rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                  <span>{rewardCooldown.eligible ? '🎁 TÜM İKRAMLARI GÖR & İZLE' : `⏳ ÇAY DEMLENİYOR (${formatRemainingTime(rewardCooldown.remainingSeconds)})`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google AdMob Intermediate Banner between Hero & Ambience Corner */}
      <div className="w-full my-1">
        <AdMobBanner format="banner" initialCreativeIndex={3} className="shadow-2xl border-amber-500/40" />
      </div>

      {/* AUTHENTIC OTTOMAN KAHVEHANE SENSORY & SOUND CORNER */}
      <div className="relative w-full rounded-3xl overflow-hidden border-2 border-amber-500/35 bg-gradient-to-r from-[#211108]/95 via-[#180c05]/95 to-[#120703]/95 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl p-3.5 sm:p-5">
        {/* Subtle Walnut Texture Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
          <SafeImage
            src="/images/ottoman_wood_inlay_texture.jpg"
            alt="Ahşap Doku"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Brass corner brackets */}
        <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-900/50 border-2 border-amber-400/50 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] shrink-0">
              <span className="animate-pulse">🕯️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-tavla font-black text-sm sm:text-base text-[#fef3c7]">
                  Tarihi Kahvehane Ambiyansı
                </span>
                <span className="text-[10px] text-amber-300 font-bold bg-amber-500/25 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  {isAmbientOn ? 'Sesler Canlı 🔊' : 'Sessiz 🔇'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-200/75">
                İnce belli çay kaşığı tıkırtısı, uzaktan tavla zarları, ud makamı ve loş kandil ışıltısı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <button
              onClick={() => soundEffects.playAuthenticTeaClink()}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-amber-500/25 text-amber-200 border border-white/15 hover:border-amber-400/50 text-xs font-serif-tavla font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow"
              title="İnce belli çay kaşığını tıkırdat"
            >
              <span>☕</span>
              <span>Çay Tıkırdat</span>
            </button>

            <button
              onClick={() => soundEffects.playOudSolo()}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-amber-500/25 text-amber-200 border border-white/15 hover:border-amber-400/50 text-xs font-serif-tavla font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow"
              title="Hicaz makamında ud teline dokun"
            >
              <span>🎶</span>
              <span>Ud Nağmesi</span>
            </button>

            <button
              onClick={() => soundEffects.playDiceCupShake()}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-amber-500/25 text-amber-200 border border-white/15 hover:border-amber-400/50 text-xs font-serif-tavla font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow"
              title="Deri fincanda zarları çalkala ve at"
            >
              <span>🎲</span>
              <span>Zar Çalkala</span>
            </button>

            <button
              onClick={() => soundEffects.playHeavyCheckerSlam()}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-amber-500/25 text-amber-200 border border-white/15 hover:border-amber-400/50 text-xs font-serif-tavla font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow"
              title="Masaya şak diye ahşap pul vur"
            >
              <span>💥</span>
              <span>Pul Şakırdat</span>
            </button>

            <button
              onClick={handleToggleAmbient}
              className={`px-3.5 py-1.5 rounded-xl font-serif-tavla text-xs font-bold transition-all flex items-center gap-1.5 border shadow-md active:scale-95 ${
                isAmbientOn
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-300'
                  : 'bg-white/[0.08] hover:bg-white/[0.15] text-amber-200 border-white/15'
              }`}
            >
              <span>{isAmbientOn ? '🔊' : '🔇'}</span>
              <span>{isAmbientOn ? 'Ambiyans Açık' : 'Ambiyansı Aç'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google AdMob Intermediate Banner between Ambience & Navigation Tabs */}
      <div className="w-full my-1">
        <AdMobBanner format="banner" initialCreativeIndex={4} className="shadow-2xl border-amber-500/40" />
      </div>

      {/* NAVIGATION TABS: Opponents & Venues */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleTabSwitch('opponents')}
            className={`relative group px-5 py-2.5 rounded-full font-serif-tavla text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              currentTab === 'opponents'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-[0_4px_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-amber-200/80 hover:text-white border border-white/10'
            }`}
          >
            <span>👥</span>
            <span>Kahvehane Ustaları ({OPPONENTS.length})</span>
          </button>
          <button
            onClick={() => handleTabSwitch('venues')}
            className={`relative group px-5 py-2.5 rounded-full font-serif-tavla text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              currentTab === 'venues'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-[0_4px_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-amber-200/80 hover:text-white border border-white/10'
            }`}
          >
            <span>🏛️</span>
            <span>Tarihi Masalar ({VENUES.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBoardStore && (
            <button
              onClick={onOpenBoardStore}
              className="relative group px-3.5 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 shadow"
              title="Özel Osmanlı ve Ahşap Tavla Tahtaları Mağazası"
            >
              <span>🪵 Tahta Mağazası</span>
            </button>
          )}
          {onOpenCustomization && (
            <button
              onClick={onOpenCustomization}
              className="relative group px-3.5 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 shadow"
              title="Kahvehane Portreleri ve Çerçeveleri"
            >
              <span>🎭 Portreler</span>
            </button>
          )}
          {onOpenAudioSettings && (
            <button
              onClick={onOpenAudioSettings}
              className="relative group px-3.5 py-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 text-xs font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 shadow"
              title="Kahvehane Müziği & Akustik Ayarlar"
            >
              <span>📻 Ses & Müzik</span>
            </button>
          )}
          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="relative group px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500/25 to-amber-600/25 hover:from-amber-500/40 hover:to-amber-600/40 text-amber-200 border border-amber-400/50 text-xs font-bold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
              title="Cloudflare Workers Destekli Dünya Liderlik Tablosu"
            >
              <span>🏆</span>
              <span>Liderlik Tablosu</span>
            </button>
          )}
          <button
            onClick={onOpenStats}
            className="relative group px-3.5 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 text-xs font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 shadow"
          >
            <span>📊 İstatistikler</span>
          </button>
        </div>
      </div>

      {/* Google AdMob Dock Strip between Navigation & Game Mode */}
      <div className="w-full my-1">
        <AdMobBanner format="dock_strip" initialCreativeIndex={5} className="shadow-md border-amber-500/30" />
      </div>

      {/* GAME MODE SELECTOR & BLITZ PROMOTION */}
      <div className="w-full p-3.5 sm:p-4 rounded-3xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider font-bold text-amber-300/80 mr-1">
            Oyun Modu:
          </span>
          <button
            onClick={() => setSelectedMode('ai')}
            className={`px-4 py-2 rounded-full font-serif-tavla text-xs font-bold transition-all flex items-center gap-2 border ${
              selectedMode === 'ai'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/40'
                : 'bg-white/[0.05] text-amber-200/70 border-white/10 hover:text-white'
            }`}
          >
            <span>🎯</span>
            <span>Standart Tavla (Süresiz)</span>
          </button>

          <button
            onClick={() => setSelectedMode('blitz')}
            className={`relative group px-4 py-2 rounded-full font-serif-tavla text-xs font-bold transition-all flex items-center gap-2 border ${
              selectedMode === 'blitz'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white border-rose-400 shadow-[0_4px_20px_rgba(244,63,94,0.45)] ring-2 ring-rose-400/60'
                : 'bg-white/[0.05] text-amber-200/70 border-white/10 hover:text-white'
            }`}
          >
            <span className="text-amber-300 animate-bounce">⚡</span>
            <span>Hızlı Maç (Blitz · 15sn)</span>
            <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider">
              +Ekstra Akçe
            </span>
          </button>
        </div>

        {selectedMode === 'blitz' ? (
          <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/15 border border-rose-400/30 px-3.5 py-1.5 rounded-full">
            <span className="animate-spin text-sm">⚡</span>
            <span className="font-semibold">
              15sn hamle süresi · Galibiyette 600 Akçe, Mars&apos;ta 1.000 Akçe bonus!
            </span>
          </div>
        ) : (
          <div className="text-xs text-amber-200/60 hidden md:block">
            Geleneksel kahvehane temposunda sakin oyun
          </div>
        )}
      </div>

      {/* Google AdMob Banner between Game Mode & Roster */}
      <div className="w-full my-1">
        <AdMobBanner format="banner" initialCreativeIndex={6} className="shadow-2xl border-amber-500/40" />
      </div>

      {/* TAB CONTENT: Kahvehane Ustaları Roster */}
      {currentTab === 'opponents' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OPPONENTS.map((opp) => {
            const isSelected = selectedOpponent.id === opp.id;
            return (
              <motion.div
                key={opp.id}
                whileHover={{ y: -4 }}
                onClick={() => {
                  setSelectedOpponent(opp);
                  onStartGame(opp, selectedMode);
                }}
                className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/50 shadow-[0_8px_25px_rgba(245,158,11,0.3)]'
                    : 'border-white/[0.1] bg-[#1a0e07]/90 hover:border-amber-400/40 hover:bg-[#201209] shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-amber-400/60 bg-[#120b07] shrink-0 shadow-md">
                      <SafeImage
                        src={opp.avatar}
                        alt={opp.name}
                        className="w-full h-full object-cover"
                        fallbackSrc="/images/avatar_genc_cirak.jpg"
                        fallbackIcon="🧔"
                        fallbackText={opp.name}
                      />
                    </div>
                    <div>
                      <div className="font-serif-tavla font-bold text-base text-[#fef3c7]">
                        {opp.name}
                      </div>
                      <div className="text-xs text-amber-400 font-medium">{opp.title}</div>
                    </div>
                  </div>

                  <p className="text-xs italic text-amber-100/70 mb-4 bg-white/[0.03] p-2.5 rounded-2xl border border-white/[0.06] leading-relaxed">
                    {opp.catchphrase}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
                  <span className="text-amber-200/60 font-medium truncate max-w-[90px]">{opp.venue}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onInspectPlayer && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onInspectPlayer(opp);
                        }}
                        className="px-2.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-amber-200 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95"
                        title={`${opp.name} profilini, hamle tercihlerini ve geçmişini incele`}
                      >
                        🔍 Profil
                      </button>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedOpponent(opp);
                        onStartGame(opp, selectedMode);
                      }}
                      className={`px-3 py-1.5 rounded-full font-serif-tavla font-bold text-xs shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                        selectedMode === 'blitz'
                          ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white border border-rose-300'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950'
                      }`}
                    >
                      <span>{selectedMode === 'blitz' ? '⚡ Başlat' : '🎲 Otur'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* 8th Slot: Ottoman Craft / Special Sponsor Card (Completes the 4x2 Grid flawlessly) */}
          <div className="p-4 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-[#231208] via-[#1a0e07] to-[#120703] flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Sponsor
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-amber-400/60 bg-[#140b05] shrink-0 shadow-md flex items-center justify-center text-2xl">
                  🪵
                </div>
                <div>
                  <div className="font-serif-tavla font-bold text-sm sm:text-base text-amber-200">
                    Kapalıçarşı Zanaat
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-medium">Özel Sedef Tavla Serisi</div>
                </div>
              </div>
              <p className="text-xs text-amber-100/75 mb-3 bg-black/40 p-2.5 rounded-2xl border border-white/5 leading-relaxed">
                El oyması ceviz, fildişi ve sedef kakmalı tarihi ustalık eserleri.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
              <span className="text-amber-300 font-bold text-[11px]">★ 4.9 Puan</span>
              <button
                onClick={() => onOpenBoardStore ? onOpenBoardStore() : onOpenRewardedAd('coins')}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif-tavla font-bold text-xs shadow transition-all active:scale-95"
              >
                İncele &amp; Keşfet ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Tarihi Masalar */}
      {currentTab === 'venues' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-[#1a0e07] border border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏛️</span>
              <div>
                <h4 className="font-serif-tavla font-black text-sm text-[#fef3c7]">Tarihi Kahvehane Masaları</h4>
                <p className="text-[11px] text-amber-200/70">Masa seçerek hemen oyuna başlayabilir veya ustalara dönebilirsiniz</p>
              </div>
            </div>
            <button
              onClick={() => handleTabSwitch('opponents')}
              className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 hover:text-white border border-rose-400/40 font-serif-tavla text-xs font-bold transition-all flex items-center gap-1.5 shadow active:scale-95"
            >
              <span>✕</span>
              <span>Ustalara Dön (Kapat)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VENUES.map((venue) => (
              <div
                key={venue.id}
                className="relative rounded-3xl overflow-hidden border border-white/[0.12] p-5 bg-[#1a0e07] shadow-xl flex flex-col justify-between min-h-44"
              >
                <div className="absolute inset-0">
                  <SafeImage
                    src={venue.bg}
                    alt={venue.title}
                    className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
                    fallbackSrc="/images/kahvehane_ambient.jpg"
                    fallbackIcon="🏛️"
                    fallbackText={venue.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140b05] via-[#140b05]/80 to-transparent" />
                </div>

                <div className="relative z-10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 mb-1 block">
                    {venue.tier}
                  </span>
                  <h3 className="font-serif-tavla text-lg font-bold text-[#fef3c7]">
                    {venue.title}
                  </h3>
                  <p className="text-xs text-amber-100/70 mt-1.5 leading-relaxed">
                    {venue.desc}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/[0.08]">
                  <span className="text-xs text-amber-200/60 font-medium">Giriş: Ücretsiz</span>
                  <button
                    onClick={() => {
                      const matchedOpp = OPPONENTS.find(o => o.venue.toLowerCase().includes(venue.id) || o.venue === venue.title) || selectedOpponent;
                      setSelectedOpponent(matchedOpp);
                      onStartGame(matchedOpp, selectedMode);
                    }}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif-tavla text-xs font-bold transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Masa Aç &amp; Oyna
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Return to Opponents Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1a0e07] border border-white/10 mt-1">
            <span className="text-xs text-amber-200/70">
              Usta kahvehane müdavimlerine dönmek için:
            </span>
            <button
              onClick={() => handleTabSwitch('opponents')}
              className="px-4 py-2 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 hover:text-white border border-rose-400/50 font-serif-tavla text-xs font-bold transition-all flex items-center gap-1.5 shadow active:scale-95"
            >
              <span>✕</span>
              <span>Masalardan Çık (Ustalara Dön)</span>
            </button>
          </div>
        </div>
      )}

      {/* Google AdMob Responsive Banner at the bottom of the Lobby */}
      <div className="w-full pt-2 pb-1">
        <AdMobBanner format="banner" className="shadow-2xl" />
      </div>
      </>
      )}
    </div>
  );
};
