'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, cloudflareStorage } from '@/lib/cloudflare/storage';
import { PlayerAvatar } from './PlayerAvatar';
import { SafeImage } from './SafeImage';
import { LeaderboardPlayer } from '@/app/api/leaderboard/route';
import { Opponent } from '@/lib/tavla/types';
import { AdMobBanner } from './AdMobBanner';

export interface InspectedProfileData {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  country?: string;
  flag?: string;
  tier: string;
  rank: number;
  stats: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    marsWins: number;
    marsLosses: number;
    winRate: string;
    favoriteRoll: string;
    avgMoveTime: string;
  };
  movePreferences: {
    pointMaking: number; // %
    hitting: number;      // %
    bearingOff: number;   // %
    escaping: number;     // %
  };
  headToHead: Array<{
    opponentName: string;
    opponentAvatar: string;
    played: number;
    wins: number;
    losses: number;
    mars: number;
  }>;
  badges: Array<{
    id: string;
    title: string;
    icon: string;
    desc: string;
    unlocked: boolean;
    date?: string;
  }>;
}

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile;
  inspectedPlayer?: LeaderboardPlayer | Opponent | null;
  onChallengePlayer?: (playerName: string) => void;
  onOpenCustomization?: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  inspectedPlayer = null,
  onChallengePlayer,
  onOpenCustomization,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'moves' | 'headToHead' | 'badges'>('overview');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isOwnProfile = !inspectedPlayer || inspectedPlayer.name === currentUserProfile.name;

  // Prepare profile data
  const profileData: InspectedProfileData = isOwnProfile
    ? {
        id: currentUserProfile.id,
        name: currentUserProfile.name,
        title: currentUserProfile.title,
        avatar: currentUserProfile.avatar || '/images/avatar_genc_cirak.jpg',
        rating: currentUserProfile.rating,
        country: 'İstanbul, Türkiye',
        flag: '🇹🇷',
        tier: currentUserProfile.rating >= 2000 ? 'Padişah (Grandmaster)' : currentUserProfile.rating >= 1800 ? 'Usta Piri (Master)' : currentUserProfile.rating >= 1600 ? 'Galata Reisi (Diamond)' : currentUserProfile.rating >= 1400 ? 'Kıdemli Kalfa (Platinum)' : 'Mahalle Şampiyonu (Gold)',
        rank: Math.max(1, 100 - Math.floor(currentUserProfile.rating / 25)),
        stats: {
          matchesPlayed: currentUserProfile.stats.matchesPlayed,
          wins: currentUserProfile.stats.wins,
          losses: currentUserProfile.stats.losses,
          marsWins: currentUserProfile.stats.marsWins,
          marsLosses: currentUserProfile.stats.marsLosses,
          winRate: currentUserProfile.stats.matchesPlayed > 0 
            ? `${Math.round((currentUserProfile.stats.wins / currentUserProfile.stats.matchesPlayed) * 100)}%` 
            : '0%',
          favoriteRoll: 'Düşeş (6-6)',
          avgMoveTime: '3.8 sn',
        },
        movePreferences: {
          pointMaking: 44,
          hitting: 28,
          bearingOff: 18,
          escaping: 10,
        },
        headToHead: [
          { opponentName: 'Mahmut Emmi', opponentAvatar: '/images/avatar_genc_cirak.jpg', played: 14, wins: 10, losses: 4, mars: 4 },
          { opponentName: 'Hacı Dayı', opponentAvatar: '/images/avatar_haci_dayi.jpg', played: 9, wins: 6, losses: 3, mars: 2 },
          { opponentName: 'Usta Selim', opponentAvatar: '/images/avatar_haci_dayi.jpg', played: 5, wins: 2, losses: 3, mars: 1 },
          { opponentName: 'Çaycı Rüstem', opponentAvatar: '/images/avatar_genc_cirak.jpg', played: 8, wins: 7, losses: 1, mars: 3 },
          { opponentName: 'Hans Becker', opponentAvatar: '/images/avatar_genc_cirak.jpg', played: 4, wins: 3, losses: 1, mars: 1 },
        ],
        badges: [
          { id: 'b1', title: 'Düşeş Efendisi', icon: '🎲', desc: 'Zarlarda düşeş hakimiyeti sağla', unlocked: true, date: 'Kazanıldı' },
          { id: 'b2', title: 'Yıldırım Hamleci', icon: '⚡', desc: '15s Blitz maçlarında galibiyet serisi', unlocked: true, date: 'Kazanıldı' },
          { id: 'b3', title: 'Mars Avcısı', icon: '🔥', desc: 'Rakibe pul toplatmadan mars et', unlocked: currentUserProfile.stats.marsWins > 0, date: 'Kazanıldı' },
          { id: 'b4', title: 'Kapı Mimarı', icon: '🏰', desc: 'Tek oyunda 4 kritik kapı al', unlocked: true, date: 'Kazanıldı' },
          { id: 'b5', title: 'Kahvehane Müdavimi', icon: '☕', desc: 'En az 10 maç tamamla', unlocked: currentUserProfile.stats.matchesPlayed >= 10 },
          { id: 'b6', title: 'Büyük Usta', icon: '👑', desc: '1800+ Elo reytingine ulaş', unlocked: currentUserProfile.rating >= 1800 },
          { id: 'b7', title: 'Usta Danışmanı', icon: '💡', desc: 'Önerilen 10 hamleyi hatasız oyna', unlocked: true, date: 'Kazanıldı' },
          { id: 'b8', title: 'Altın Kese', icon: '🪙', desc: 'Kasadaki akçeyi 1000 üzerine çıkar', unlocked: currentUserProfile.coins >= 1000 },
        ],
      }
    : {
        id: inspectedPlayer.id || 'p_unknown',
        name: inspectedPlayer.name,
        title: inspectedPlayer.title,
        avatar: inspectedPlayer.avatar || '/images/avatar_haci_dayi.jpg',
        rating: inspectedPlayer.rating,
        country: 'country' in inspectedPlayer ? (inspectedPlayer as LeaderboardPlayer).country : 'Türkiye',
        flag: 'flag' in inspectedPlayer ? (inspectedPlayer as LeaderboardPlayer).flag : '🇹🇷',
        tier: 'tier' in inspectedPlayer ? (inspectedPlayer as LeaderboardPlayer).tier : inspectedPlayer.rating >= 1800 ? 'Usta Piri' : 'Galata Reisi',
        rank: 'rank' in inspectedPlayer ? (inspectedPlayer as LeaderboardPlayer).rank : 2,
        stats: {
          matchesPlayed: 'wins' in inspectedPlayer ? (inspectedPlayer as LeaderboardPlayer).wins + (inspectedPlayer as LeaderboardPlayer).losses : 120,
          wins: 'wins' in inspectedPlayer ? (inspectedPlayer as LeaderboardPlayer).wins : 92,
          losses: 'losses' in inspectedPlayer ? (inspectedPlayer as LeaderboardPlayer).losses : 28,
          marsWins: 'marsCount' in inspectedPlayer ? (inspectedPlayer as LeaderboardPlayer).marsCount : 35,
          marsLosses: 8,
          winRate: 'winRate' in inspectedPlayer ? (inspectedPlayer as LeaderboardPlayer).winRate : '77%',
          favoriteRoll: 'Şeş-Beş (6-5)',
          avgMoveTime: '2.9 sn',
        },
        movePreferences: {
          pointMaking: 50,
          hitting: 30,
          bearingOff: 12,
          escaping: 8,
        },
        headToHead: [
          { opponentName: currentUserProfile.name, opponentAvatar: currentUserProfile.avatar || '/images/avatar_genc_cirak.jpg', played: 6, wins: 4, losses: 2, mars: 1 },
          { opponentName: 'Hacı Dayı', opponentAvatar: '/images/avatar_haci_dayi.jpg', played: 18, wins: 12, losses: 6, mars: 5 },
          { opponentName: 'Mahmut Emmi', opponentAvatar: '/images/avatar_genc_cirak.jpg', played: 15, wins: 11, losses: 4, mars: 4 },
        ],
        badges: [
          { id: 'b1', title: 'Kapalıçarşı Piri', icon: '👑', desc: 'Kapalıçarşı tavla derneği baş ustası', unlocked: true, date: 'Onaylı Rozet' },
          { id: 'b2', title: 'Yıldırım Zarlar', icon: '⚡', desc: 'Blitz modunda 100+ zafer', unlocked: true, date: 'Onaylı Rozet' },
          { id: 'b3', title: 'Korkusuz Marsçı', icon: '🔥', desc: '50+ resmi mars galibiyeti', unlocked: true, date: 'Onaylı Rozet' },
          { id: 'b4', title: 'Çelik Savunma', icon: '🛡️', desc: 'Açık vermeden kapı örme ustası', unlocked: true, date: 'Onaylı Rozet' },
        ],
      };

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl"
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#1e0f07] via-[#130703] to-[#0b0301] border-2 border-amber-500/35 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden"
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

          {/* Ambient Lighting */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          {/* HEADER SECTION */}
          <div className="relative z-10 px-5 sm:px-7 pt-5 pb-4 border-b border-white/[0.08] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <PlayerAvatar
                  avatarUrl={profileData.avatar}
                  frameId="frame_classic_wood"
                  size={64}
                />
                <span className="absolute -bottom-1 -right-1 text-sm bg-black/60 rounded-full px-1 border border-white/20">
                  {profileData.flag}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif-tavla text-xl sm:text-2xl font-black text-white">
                    {profileData.name}
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40">
                    {profileData.title}
                  </span>
                  {isOwnProfile ? (
                    <span className="text-[10px] uppercase font-bold text-stone-900 bg-amber-400 px-2 py-0.2 rounded-full">
                      SİZİN PROFİLİNİZ
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-cyan-200 bg-cyan-500/20 px-2 py-0.2 rounded-full border border-cyan-400/30">
                      OYUNCU İNCELEME
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-amber-200/70 mt-1 flex-wrap">
                  <span>📍 {profileData.country}</span>
                  <span>·</span>
                  <span className="text-amber-300 font-bold">🏆 Küresel Sıra: #{profileData.rank}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">🌟 {profileData.tier}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isOwnProfile && onChallengePlayer && (
                <button
                  onClick={() => {
                    onChallengePlayer(profileData.name);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-serif-tavla font-black text-xs shadow-md border border-rose-400/50 transition-all active:scale-95 flex items-center gap-1.5"
                  title="Bu ustayla hemen maç yap"
                >
                  <span>⚔️</span>
                  <span>Meydan Oku</span>
                </button>
              )}

              {isOwnProfile && onOpenCustomization && (
                <button
                  onClick={() => {
                    onOpenCustomization();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-amber-200 text-xs font-semibold border border-white/10 transition-colors hidden sm:flex items-center gap-1"
                >
                  <span>🎨</span>
                  <span>Görünüm</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 hover:text-white border border-rose-400/50 text-xs font-serif-tavla font-bold flex items-center gap-1.5 transition-all shadow active:scale-95"
                title="Kapat"
              >
                <span className="text-sm">✕</span>
                <span>Kapat</span>
              </button>
            </div>
          </div>

          {/* TAB BAR NAVIGATION */}
          <div className="relative z-10 px-5 sm:px-7 py-2.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                  : 'bg-white/[0.04] text-amber-100/70 border-white/10 hover:text-white'
              }`}
            >
              <span>📊</span>
              <span>Genel Bakış</span>
            </button>

            <button
              onClick={() => setActiveTab('moves')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                activeTab === 'moves'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                  : 'bg-white/[0.04] text-amber-100/70 border-white/10 hover:text-white'
              }`}
            >
              <span>🎯</span>
              <span>Hamle &amp; Taktik Stili</span>
            </button>

            <button
              onClick={() => setActiveTab('headToHead')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                activeTab === 'headToHead'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                  : 'bg-white/[0.04] text-amber-100/70 border-white/10 hover:text-white'
              }`}
            >
              <span>🤝</span>
              <span>Rakiplere Karşı</span>
            </button>

            <button
              onClick={() => setActiveTab('badges')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 border whitespace-nowrap ${
                activeTab === 'badges'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                  : 'bg-white/[0.04] text-amber-100/70 border-white/10 hover:text-white'
              }`}
            >
              <span>🎖️</span>
              <span>Rozetler &amp; Başarımlar</span>
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-7 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
                    <span className="text-[10px] uppercase font-bold text-amber-200/60 block">Reyting / Elo</span>
                    <span className="font-mono font-black text-xl text-amber-400">{profileData.rating} P</span>
                    <span className="text-[10px] text-amber-300 block mt-0.5">{profileData.tier}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
                    <span className="text-[10px] uppercase font-bold text-amber-200/60 block">Galibiyet Oranı</span>
                    <span className="font-mono font-black text-xl text-emerald-400">{profileData.stats.winRate}</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">{profileData.stats.wins} Galibiyet / {profileData.stats.matchesPlayed} Maç</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
                    <span className="text-[10px] uppercase font-bold text-amber-200/60 block">Mars Başarısı</span>
                    <span className="font-mono font-black text-xl text-rose-400">{profileData.stats.marsWins} Mars</span>
                    <span className="text-[10px] text-rose-300/70 block mt-0.5">({profileData.stats.marsLosses} Mars Kaybı)</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
                    <span className="text-[10px] uppercase font-bold text-amber-200/60 block">Ortalama Süre</span>
                    <span className="font-mono font-black text-xl text-cyan-400">{profileData.stats.avgMoveTime}</span>
                    <span className="text-[10px] text-cyan-200/60 block mt-0.5">Hamle Başına</span>
                  </div>
                </div>

                {/* Performance Visualizer */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-serif-tavla font-bold text-white">Galibiyet &amp; Mağlubiyet Dağılımı</span>
                    <span className="font-mono text-amber-300">{profileData.stats.wins} G - {profileData.stats.losses} M</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/[0.08] overflow-hidden flex">
                    <div
                      style={{ width: profileData.stats.winRate }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                    <div className="flex-1 h-full bg-rose-500/60" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Galibiyetler ({profileData.stats.winRate})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Mağlubiyetler
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MOVES & TACTICS */}
            {activeTab === 'moves' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <h3 className="font-serif-tavla font-bold text-sm text-[#fef3c7] flex items-center gap-2">
                    <span>🎯</span>
                    <span>En Sık Kullanılan Hamle Tercihleri</span>
                  </h3>

                  {/* Move bars */}
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-amber-200">🏰 Kapı Kurma (Point Making)</span>
                        <span className="font-mono font-bold text-amber-300">%{profileData.movePreferences.pointMaking}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div style={{ width: `${profileData.movePreferences.pointMaking}%` }} className="h-full bg-amber-400 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-rose-200">⚔️ Açık Kırma (Hitting Blots)</span>
                        <span className="font-mono font-bold text-rose-300">%{profileData.movePreferences.hitting}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div style={{ width: `${profileData.movePreferences.hitting}%` }} className="h-full bg-rose-500 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-emerald-200">🏆 Hızlı Pul Toplama (Bearing Off)</span>
                        <span className="font-mono font-bold text-emerald-300">%{profileData.movePreferences.bearingOff}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div style={{ width: `${profileData.movePreferences.bearingOff}%` }} className="h-full bg-emerald-400 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-cyan-200">🏃 Kaçış &amp; Emniyet (Escapes)</span>
                        <span className="font-mono font-bold text-cyan-300">%{profileData.movePreferences.escaping}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div style={{ width: `${profileData.movePreferences.escaping}%` }} className="h-full bg-cyan-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] uppercase font-bold text-amber-300/80 block">Favori Zar Çifti</span>
                    <span className="font-serif-tavla font-black text-base text-white mt-1 block">🎲 {profileData.stats.favoriteRoll}</span>
                    <span className="text-[11px] text-amber-200/60 block mt-0.5">En yüksek galibiyet getiren zar kombinasyonu</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] uppercase font-bold text-amber-300/80 block">Oyun Tarzı / Ekolü</span>
                    <span className="font-serif-tavla font-black text-base text-amber-300 mt-1 block">🏛️ Kapı &amp; Baskı Ekolü</span>
                    <span className="text-[11px] text-amber-200/60 block mt-0.5">Stratejik altın kapılar kurarak rakibin risklerini cezalandırır.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HEAD TO HEAD */}
            {activeTab === 'headToHead' && (
              <div className="space-y-3">
                <div className="text-xs text-amber-200/70 mb-1">
                  Bu oyuncunun kahvehane ustaları ve rakiplerine karşı kafa kafaya maç karnesi:
                </div>

                <div className="space-y-2">
                  {profileData.headToHead.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0">
                          <SafeImage
                            src={rec.opponentAvatar}
                            alt={rec.opponentName}
                            className="w-full h-full object-cover"
                            fallbackSrc="/images/avatar_genc_cirak.jpg"
                            fallbackIcon="👤"
                            fallbackText={rec.opponentName}
                          />
                        </div>
                        <div>
                          <h4 className="font-serif-tavla font-bold text-sm text-white">
                            vs {rec.opponentName}
                          </h4>
                          <span className="text-[11px] text-amber-200/60">
                            Toplam {rec.played} Maç Karşılaşması
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-serif-tavla font-bold text-xs sm:text-sm text-emerald-400 tabular-nums">
                          {rec.wins}G - {rec.losses}M
                        </div>
                        <div className="text-[10px] text-amber-300/80 tabular-nums">
                          {rec.mars} Mars Galibiyeti
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: BADGES & ACHIEVEMENTS */}
            {activeTab === 'badges' && (
              <div className="space-y-3">
                <div className="text-xs text-amber-200/70 mb-1">
                  Kazanılan resmi kahvehane madalyaları ve ustalık nişanları:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {profileData.badges.map(badge => (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                        badge.unlocked
                          ? 'bg-amber-500/10 border-amber-400/40 shadow-[0_2px_12px_rgba(245,158,11,0.15)]'
                          : 'bg-white/[0.02] border-white/5 opacity-50'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                        badge.unlocked ? 'bg-amber-500/25 border border-amber-400/50' : 'bg-white/5 border border-white/10'
                      }`}>
                        {badge.icon}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif-tavla font-bold text-xs sm:text-sm text-white truncate">
                            {badge.title}
                          </h4>
                          {badge.unlocked && (
                            <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-amber-100/70 truncate mt-0.5">
                          {badge.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AdMob Sponsor Dock Strip */}
          <div className="px-4 py-1 bg-black/40 border-t border-white/[0.06]">
            <AdMobBanner format="dock_strip" className="shadow-none border-amber-500/20" />
          </div>

          {/* Footer Close Bar */}
          <div className="relative z-10 px-5 sm:px-7 py-3 bg-black/40 border-t border-white/[0.08] flex items-center justify-between shrink-0 gap-2 flex-wrap">
            <span className="text-xs text-amber-200/60 hidden sm:inline">
              Resmi Kahvehane Sicili &amp; Oyuncu Portresi
            </span>
            <div className="flex items-center gap-2 ml-auto">
              {isOwnProfile && (
                <button
                  onClick={() => {
                    if (window.confirm('Tüm profil, istatistik ve akçeler silinsin mi?')) {
                      cloudflareStorage.resetProfile();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 text-xs font-bold border border-rose-400/40 transition-all active:scale-95"
                  title="Cihazdaki tüm veriyi sil"
                >
                  🗑 Verilerimi Sil
                </button>
              )}
              <a
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-amber-200 text-xs font-bold border border-white/10 transition-all"
              >
                Gizlilik
              </a>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-amber-200 hover:text-white border border-white/15 text-xs font-serif-tavla font-bold transition-all active:scale-95"
              >
                ✕ Pencereyi Kapat
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
