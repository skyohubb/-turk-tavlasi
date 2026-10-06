'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '@/lib/cloudflare/storage';
import { PlayerAvatar } from './PlayerAvatar';
import { LeaderboardPlayer } from '@/app/api/leaderboard/route';
import { SafeImage } from './SafeImage';
import { AdMobBanner } from './AdMobBanner';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onInspectPlayer?: (player: LeaderboardPlayer) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onInspectPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'blitz' | 'mars'>('all');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [edgeLocation, setEdgeLocation] = useState<string>('Yerel Cihaz');
  const [cachedTime, setCachedTime] = useState<string>('');
  const isOnlineLeague = process.env.NEXT_PUBLIC_ENABLE_ONLINE_LEAGUE === 'true';

  useEffect(() => {
    let ignore = false;
    if (isOpen) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/leaderboard?tab=${activeTab}`);
          if (res.ok && !ignore) {
            const data = await res.json();
            setPlayers(data.players || []);
            if (data.edgeLocation) setEdgeLocation(data.edgeLocation);
            if (data.cachedAt) {
              const d = new Date(data.cachedAt);
              setCachedTime(d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
            }
          }
        } catch (err) {
          console.warn('Error fetching leaderboard from Cloudflare Worker:', err);
        } finally {
          if (!ignore) {
            setIsLoading(false);
          }
        }
      };

      loadData();
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, activeTab]);

  // v1.0: çevrimdışı lig. Liste yereldir, küresel sıralama iddiası yoktur.

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?tab=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players || []);
        if (data.edgeLocation) setEdgeLocation(data.edgeLocation);
        if (data.cachedAt) {
          const d = new Date(data.cachedAt);
          setCachedTime(d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('Error refreshing leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine user tier based on rating
  const getUserTier = (rating: number) => {
    if (rating >= 2000) return { name: 'Padişah (Grandmaster)', color: 'from-amber-400 to-amber-600', text: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-400/50' };
    if (rating >= 1800) return { name: 'Usta Piri (Master)', color: 'from-purple-400 to-purple-600', text: 'text-purple-300', bg: 'bg-purple-500/20', border: 'border-purple-400/50' };
    if (rating >= 1600) return { name: 'Galata Reisi (Diamond)', color: 'from-cyan-400 to-blue-600', text: 'text-cyan-300', bg: 'bg-cyan-500/20', border: 'border-cyan-400/50' };
    if (rating >= 1400) return { name: 'Kıdemli Kalfa (Platinum)', color: 'from-emerald-400 to-teal-600', text: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-400/50' };
    if (rating >= 1200) return { name: 'Mahalle Şampiyonu (Gold)', color: 'from-yellow-400 to-amber-500', text: 'text-amber-200', bg: 'bg-amber-500/15', border: 'border-amber-400/30' };
    return { name: 'Hevesli Çırak (Silver)', color: 'from-stone-300 to-stone-500', text: 'text-stone-300', bg: 'bg-stone-500/20', border: 'border-stone-400/30' };
  };

  // Determine user approximate rank
  const calculateUserRank = () => {
    const higherCount = players.filter(p => p.rating > userProfile.rating).length;
    return higherCount + 1;
  };

  const userRank = calculateUserRank();
  const userTier = getUserTier(userProfile.rating);

  // Top 3 Podium players
  const top1 = players[0];
  const top2 = players[1];
  const top3 = players[2];

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
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#1c0e07] via-[#130703] to-[#0b0301] border-2 border-amber-500/35 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.2)] backdrop-blur-3xl overflow-hidden"
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

          {/* Ambient Lighting Gradients */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

          {/* MODAL HEADER */}
          <div className="relative z-10 px-5 sm:px-8 pt-5 pb-4 border-b border-white/[0.08] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif-tavla text-xl sm:text-2xl font-black text-white tracking-wide">
                    Kahvehane Ligi
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                    Çevrimdışı
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-200/70 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{isOnlineLeague ? 'Çevrimiçi lig' : 'Bu cihazda yerel sıralama'}</span>
                  <span>·</span>
                  <span className="text-amber-300 font-mono text-[11px]">{edgeLocation}</span>
                  {cachedTime && <span>({cachedTime})</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-amber-400/40 text-amber-200 flex items-center justify-center text-sm transition-all active:scale-95 disabled:opacity-50"
                title="Sıralamayı Yenile"
              >
                <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
              </button>
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

          {/* TAB BAR FILTER */}
          <div className="relative z-10 px-5 sm:px-8 py-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 border ${
                  activeTab === 'all'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.4)]'
                    : 'bg-white/[0.05] text-amber-100/70 border-white/10 hover:text-white'
                }`}
              >
                <span>🌍</span>
                <span>Genel Klasman (Elo)</span>
              </button>

              <button
                onClick={() => setActiveTab('blitz')}
                className={`px-4 py-1.5 rounded-full text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 border ${
                  activeTab === 'blitz'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-rose-400 shadow-[0_4px_16px_rgba(244,63,94,0.4)]'
                    : 'bg-white/[0.05] text-amber-100/70 border-white/10 hover:text-white'
                }`}
              >
                <span className="text-amber-300">⚡</span>
                <span>Hızlı Maç (Blitz Ustaları)</span>
              </button>

              <button
                onClick={() => setActiveTab('mars')}
                className={`px-4 py-1.5 rounded-full text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 border ${
                  activeTab === 'mars'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 border-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.4)]'
                    : 'bg-white/[0.05] text-amber-100/70 border-white/10 hover:text-white'
                }`}
              >
                <span>🔥</span>
                <span>Mars Kralları</span>
              </button>
            </div>

            <div className="text-[11px] text-amber-200/60 hidden sm:block">
              İlk 100 Usta Arasında Canlı Sıralama
            </div>
          </div>

          {/* SCROLLABLE CONTENT BODY */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-8 py-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
            {/* TOP 3 PODIUM SHOWCASE */}
            {top1 && top2 && top3 && !isLoading && (
              <div className="pt-2 pb-1">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto">
                  {/* 2nd Place: Silver */}
                  <div
                    onClick={() => onInspectPlayer?.(top2)}
                    className="relative flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.12] hover:border-amber-400/50 backdrop-blur-xl text-center shadow-lg transition-all duration-200 cursor-pointer group"
                    title={`${top2.name} profilini incele`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-110 transition-transform">🥈</span>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-stone-300/80 mb-2 shadow-md">
                      <SafeImage
                        src={top2.avatar}
                        alt={top2.name}
                        className="w-full h-full object-cover"
                        fallbackSrc="/images/avatar_genc_cirak.jpg"
                        fallbackIcon="🥈"
                        fallbackText={top2.name}
                      />
                      <span className="absolute bottom-0 right-0 text-xs">{top2.flag}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-stone-300">#2 Sıra</span>
                    <h3 className="font-serif-tavla font-bold text-xs sm:text-sm text-white group-hover:text-amber-200 truncate max-w-full">
                      {top2.name}
                    </h3>
                    <span className="text-[10px] text-purple-300 font-semibold truncate max-w-full">
                      {top2.tier}
                    </span>
                    <div className="mt-2 text-xs font-black text-amber-300 tabular-nums">
                      {top2.wins} Galibiyet
                    </div>
                    <span className="text-[10px] text-amber-200/60 font-mono">{top2.rating} P</span>
                    <span className="mt-1 text-[9px] text-amber-300/80 opacity-0 group-hover:opacity-100 transition-opacity">Profili Gör ↗</span>
                  </div>

                  {/* 1st Place: Gold (Elevated Podium) */}
                  <div
                    onClick={() => onInspectPlayer?.(top1)}
                    className="relative flex flex-col items-center p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-500/20 via-amber-900/20 to-black/60 hover:from-amber-500/30 border-2 border-amber-400 shadow-[0_10px_35px_rgba(245,158,11,0.35)] backdrop-blur-2xl text-center -translate-y-2 transition-all duration-200 cursor-pointer group"
                    title={`${top1.name} profilini incele`}
                  >
                    <span className="absolute -top-3.5 text-2xl animate-bounce">👑</span>
                    <span className="text-3xl sm:text-4xl mb-1 group-hover:scale-110 transition-transform">🥇</span>
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-400 mb-2 shadow-[0_0_16px_rgba(245,158,11,0.5)]">
                      <SafeImage
                        src={top1.avatar}
                        alt={top1.name}
                        className="w-full h-full object-cover"
                        fallbackSrc="/images/avatar_genc_cirak.jpg"
                        fallbackIcon="🥇"
                        fallbackText={top1.name}
                      />
                      <span className="absolute bottom-0 right-0 text-xs">{top1.flag}</span>
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">
                      ŞAMPİYON
                    </span>
                    <h3 className="font-serif-tavla font-black text-sm sm:text-base text-[#fef3c7] group-hover:text-amber-200 truncate max-w-full">
                      {top1.name}
                    </h3>
                    <span className="text-[11px] text-amber-300 font-bold truncate max-w-full">
                      {top1.tier}
                    </span>
                    <div className="mt-2 text-sm font-black text-amber-300 tabular-nums">
                      {top1.wins} Galibiyet
                    </div>
                    <span className="text-xs text-amber-200/80 font-mono font-bold">
                      {top1.rating} P
                    </span>
                    <span className="mt-1 text-[9px] text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold">Profili Gör ↗</span>
                  </div>

                  {/* 3rd Place: Bronze */}
                  <div
                    onClick={() => onInspectPlayer?.(top3)}
                    className="relative flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.12] hover:border-amber-400/50 backdrop-blur-xl text-center shadow-lg transition-all duration-200 cursor-pointer group"
                    title={`${top3.name} profilini incele`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-110 transition-transform">🥉</span>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-amber-700/80 mb-2 shadow-md">
                      <SafeImage
                        src={top3.avatar}
                        alt={top3.name}
                        className="w-full h-full object-cover"
                        fallbackSrc="/images/avatar_genc_cirak.jpg"
                        fallbackIcon="🥉"
                        fallbackText={top3.name}
                      />
                      <span className="absolute bottom-0 right-0 text-xs">{top3.flag}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-600">#3 Sıra</span>
                    <h3 className="font-serif-tavla font-bold text-xs sm:text-sm text-white group-hover:text-amber-200 truncate max-w-full">
                      {top3.name}
                    </h3>
                    <span className="text-[10px] text-cyan-300 font-semibold truncate max-w-full">
                      {top3.tier}
                    </span>
                    <div className="mt-2 text-xs font-black text-amber-300 tabular-nums">
                      {top3.wins} Galibiyet
                    </div>
                    <span className="text-[10px] text-amber-200/60 font-mono">{top3.rating} P</span>
                    <span className="mt-1 text-[9px] text-amber-300/80 opacity-0 group-hover:opacity-100 transition-opacity">Profili Gör ↗</span>
                  </div>
                </div>
              </div>
            )}

            {/* Google AdMob Banner between Podium & Table */}
            <div className="my-1">
              <AdMobBanner format="banner" initialCreativeIndex={2} className="shadow-lg border-amber-500/30" />
            </div>

            {/* FULL RANKINGS TABLE */}
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-inner">
              <div className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.08] text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-200/60 bg-black/30">
                <span className="col-span-1 text-center">Sıra</span>
                <span className="col-span-5 sm:col-span-4">Usta &amp; Unvan</span>
                <span className="col-span-3 sm:col-span-3">Kademe / Lig</span>
                <span className="col-span-3 sm:col-span-2 text-right">Galibiyet</span>
                <span className="hidden sm:block sm:col-span-2 text-right">Reyting</span>
              </div>

              {isLoading ? (
                <div className="py-16 text-center text-amber-200/60 text-sm flex flex-col items-center gap-3">
                  <span className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span>Yerel lig verileri yükleniyor...</span>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {players.map(player => {
                    const isTop3 = player.rank <= 3;
                    return (
                      <div
                        key={player.id}
                        onClick={() => onInspectPlayer?.(player)}
                        className={`grid grid-cols-12 px-4 py-3 items-center text-xs transition-all hover:bg-amber-500/15 cursor-pointer group ${
                          isTop3 ? 'bg-amber-500/[0.04]' : ''
                        }`}
                        title={`${player.name} profilini incele`}
                      >
                        {/* Rank */}
                        <div className="col-span-1 text-center font-bold">
                          {player.rank === 1 ? (
                            <span className="text-base">🥇</span>
                          ) : player.rank === 2 ? (
                            <span className="text-base">🥈</span>
                          ) : player.rank === 3 ? (
                            <span className="text-base">🥉</span>
                          ) : (
                            <span className="font-mono text-stone-300 tabular-nums">
                              #{player.rank}
                            </span>
                          )}
                        </div>

                        {/* Player Info */}
                        <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 pr-2">
                          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/20 shrink-0">
                            <SafeImage
                              src={player.avatar}
                              alt={player.name}
                              className="w-full h-full object-cover"
                              fallbackSrc="/images/avatar_genc_cirak.jpg"
                              fallbackIcon="👤"
                              fallbackText={player.name}
                            />
                            <span className="absolute bottom-0 right-0 text-[10px] leading-none">
                              {player.flag}
                            </span>
                          </div>
                          <div className="truncate">
                            <div className="font-serif-tavla font-bold text-white text-xs sm:text-sm truncate">
                              {player.name}
                            </div>
                            <div className="text-[10px] text-amber-300/80 truncate">
                              {player.title}
                            </div>
                          </div>
                        </div>

                        {/* Tier */}
                        <div className="col-span-3 sm:col-span-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border truncate max-w-full ${
                              player.tierId === 'grandmaster'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                                : player.tierId === 'master'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                                : player.tierId === 'diamond'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                                : player.tierId === 'platinum'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                                : 'bg-yellow-500/15 text-yellow-200 border-yellow-400/30'
                            }`}
                          >
                            {player.tier}
                          </span>
                        </div>

                        {/* Wins & Mars */}
                        <div className="col-span-3 sm:col-span-2 text-right">
                          <div className="font-serif-tavla font-bold text-amber-200 text-xs sm:text-sm tabular-nums">
                            {player.wins} G
                          </div>
                          <div className="text-[10px] text-amber-200/50 tabular-nums">
                            {player.marsCount} Mars · {player.winRate}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="hidden sm:block sm:col-span-2 text-right">
                          <span className="font-mono font-bold text-amber-400 text-xs tabular-nums bg-black/40 px-2 py-0.5 rounded border border-white/10">
                            {player.rating} P
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* AdMob Sponsor Dock Strip */}
          <div className="px-4 py-1 bg-black/40">
            <AdMobBanner format="dock_strip" className="shadow-none border-amber-500/20" />
          </div>

          {/* USER'S LIVE PINNED STATUS FOOTER */}
          <div className="relative z-10 px-5 sm:px-8 py-3.5 bg-gradient-to-r from-amber-500/15 via-[#180c05] to-amber-600/15 border-t border-amber-400/40 flex items-center justify-between gap-4 flex-wrap shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <PlayerAvatar
                avatarUrl={userProfile.avatar || '/images/avatar_genc_cirak.jpg'}
                frameId={userProfile.frameId || 'frame_classic_wood'}
                size={40}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-tavla font-black text-sm text-[#fef3c7]">
                    {userProfile.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-stone-900 bg-amber-400 px-2 py-0.2 rounded-full">
                    SİZ
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${userTier.bg} ${userTier.text} ${userTier.border}`}
                  >
                    {userTier.name}
                  </span>
                </div>
                <div className="text-xs text-amber-200/70">
                  Çevrimdışı Lig Sırası (yerel): <strong className="text-amber-300">#{userRank}</strong> ·{' '}
                  <strong className="text-amber-300">{userProfile.stats.wins} Galibiyet</strong> ({userProfile.stats.marsWins} Mars)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-amber-200/60 font-bold">
                  Canlı Reyting
                </span>
                <span className="font-mono font-black text-base text-amber-400 tabular-nums">
                  {userProfile.rating} P
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-amber-200 hover:text-white border border-white/15 text-xs font-serif-tavla font-bold transition-all active:scale-95 ml-2"
              >
                ✕ Kapat
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
