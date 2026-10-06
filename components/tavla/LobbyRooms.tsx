'use client';

// Alt bar odaları: ana sayfayı 5 hafif odaya böler. Aktif olmayan oda
// DOM'a girmez — telefon rahat nefes alır.

import React, { useState, useEffect } from 'react';
import { BOARD_SKINS as SKINS, boardDiscountPrice } from '@/lib/tavla/customizationData';
import { cloudflareStorage, UserProfile } from '@/lib/cloudflare/storage';
import { soundEffects } from '@/lib/audio/soundEffects';
import { formatCoins, formatCountdown } from '@/lib/format';
import { useToast } from '@/hooks/useToast';
import { PlayerAvatar } from './PlayerAvatar';
import { SafeImage } from './SafeImage';

export type LobbyRoom = 'oyna' | 'magaza' | 'ikram' | 'lig' | 'profil';

interface RoomProps {
  userProfile: UserProfile;
  rewardCooldown: { eligible: boolean; remainingSeconds: number; reason: string; dailyRemaining?: number };
  onOpenRewardedAd: (type?: 'coins' | 'energy' | 'reroll' | 'time') => void;
  onOpenLeaderboard?: () => void;
  onOpenProfile?: () => void;
  onOpenStats: () => void;
  onOpenCustomization?: () => void;
  onOpenBoardStore?: () => void;
  onOpenAudioSettings?: () => void;
}

function RoomToast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="mb-3 px-3 py-2 rounded-xl bg-[#2e1a0f] border border-[#d97706] text-xs text-[#fbbf24] text-center font-medium">
      {msg}
    </div>
  );
}

// ---------- MAĞAZA ODASI: kompakt tahta vitrini (normal fiyat anında alınır) ----------
export const MagazaRoom: React.FC<RoomProps> = ({ userProfile, onOpenBoardStore }) => {
  const { msg, show } = useToast();
  const unlocked = userProfile.unlockedBoardSkins || ['board_ceviz_klasik'];
  const activeId = userProfile.boardSkinId || 'board_ceviz_klasik';

  const buyNormal = (skinId: string) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) return;
    const p = cloudflareStorage.getProfile();
    const unl = p.unlockedBoardSkins || ['board_ceviz_klasik'];
    if (unl.includes(skin.id)) {
      cloudflareStorage.saveProfile({ ...p, boardSkinId: skin.id });
      soundEffects.playCheckerDrop();
      show(`🪵 "${skin.name}" kuşanıldı!`);
      return;
    }
    if (p.coins < skin.requiredCoins) {
      soundEffects.playCheckerHit();
      show(`Akçe yetmiyor! 🪙 ${formatCoins(skin.requiredCoins)} lazım. 📺 ile %50 indirimi kap!`);
      return;
    }
    cloudflareStorage.saveProfile({
      ...p,
      coins: p.coins - skin.requiredCoins,
      boardSkinId: skin.id,
      unlockedBoardSkins: Array.from(new Set([...unl, skin.id])),
    });
    soundEffects.playCoinReward();
    show(`🎉 "${skin.name}" alındı ve kuşanıldı!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 px-4 py-3">
      <RoomToast msg={msg} />
      <div className="flex items-center justify-between">
        <h2 className="font-serif-tavla font-black text-lg text-white">🪵 Tahta Mağazası</h2>
        <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/40 tabular-nums">
          🪙 {formatCoins(userProfile.coins)}
        </span>
      </div>
      <p className="text-[11px] text-amber-200/70 -mt-2">
        Normal fiyatla hemen al veya 📺 ile %50 indirim çeki kap. Detaylı önizleme için tam mağazayı aç.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SKINS.map(skin => {
          const isUnl = unlocked.includes(skin.id);
          const isActive = activeId === skin.id;
          const hasDisc = !isUnl && cloudflareStorage.hasBoardDiscount(skin.id);
          return (
            <div
              key={skin.id}
              className={`p-3 rounded-2xl border flex items-center gap-3 ${
                isActive ? 'border-amber-400 bg-amber-500/15' : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="w-20 h-14 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-black">
                <SafeImage src={skin.previewImage} alt={skin.name} className="w-full h-full object-cover" fallbackIcon="🪵" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif-tavla font-bold text-xs text-[#fef3c7] truncate">{skin.name}</div>
                <div className="text-[10px] text-amber-200/60 truncate">{skin.woodType}</div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {isActive ? (
                    <span className="text-[10px] font-black text-emerald-300">✓ AKTİF</span>
                  ) : isUnl ? (
                    <button
                      onClick={() => buyNormal(skin.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-500 text-stone-950 text-[11px] font-black active:scale-95"
                    >
                      KUŞAN
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => buyNormal(skin.id)}
                        className="px-3 py-1 rounded-lg bg-white/10 text-amber-100 text-[11px] font-black border border-white/20 active:scale-95 tabular-nums"
                      >
                        🪙 {formatCoins(skin.requiredCoins)}
                      </button>
                      {hasDisc ? (
                        <button
                          onClick={() => buyNormal(skin.id)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black active:scale-95 tabular-nums"
                        >
                          🪙 {formatCoins(boardDiscountPrice(skin.requiredCoins))}
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenBoardStore?.()}
                          className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 text-[11px] font-black active:scale-95 tabular-nums"
                        >
                          📺 {formatCoins(boardDiscountPrice(skin.requiredCoins))}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {onOpenBoardStore && (
        <button
          onClick={onOpenBoardStore}
          className="w-full py-2.5 rounded-2xl bg-white/[0.06] text-amber-200 text-xs font-bold border border-white/10"
        >
          🪵 Tam Mağazayı Aç (büyük önizleme + indirim videosu)
        </button>
      )}
    </div>
  );
};

// ---------- İKRAM ODASI ----------
const IKRAMS = [
  { type: 'coins' as const, icon: '🪙', name: '500 Altın Akçe', desc: 'Tahta açmak için anında akçe.' },
  { type: 'energy' as const, icon: '☕', name: 'Tam Can (5/5)', desc: 'Kesintisiz maç için çay.' },
  { type: 'reroll' as const, icon: '🎲', name: '+1 Zar Yenileme', desc: 'Ters zarı bir kez yenile.' },
  { type: 'time' as const, icon: '⏳', name: '+2 Ek Süre', desc: 'Blitz için 15sn jokerleri.' },
];

export const IkramRoom: React.FC<RoomProps> = ({ userProfile, rewardCooldown, onOpenRewardedAd }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 px-4 py-3">
    <div className="flex items-center justify-between">
      <h2 className="font-serif-tavla font-black text-lg text-white">🎁 Günün İkramları</h2>
      <span className="text-[11px] text-amber-200/70 font-mono">Kalan: {rewardCooldown.dailyRemaining ?? 8}</span>
    </div>
    {!rewardCooldown.eligible && (
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/35 text-center text-xs font-bold text-amber-300">
        ⏳ Sonraki ikram: {formatCountdown(rewardCooldown.remainingSeconds)}
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {IKRAMS.map(k => (
        <div key={k.type} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center gap-3">
          <span className="text-3xl">{k.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-serif-tavla font-bold text-sm text-white">{k.name}</div>
            <div className="text-[11px] text-amber-200/60">{k.desc}</div>
          </div>
          <button
            onClick={() => onOpenRewardedAd(k.type)}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-black active:scale-95 shrink-0"
          >
            📺 İZLE
          </button>
        </div>
      ))}
    </div>
    <p className="text-[10px] text-amber-200/50 text-center">
      Her ikram için bir video izlenir. Canın bittiyse beklemeden izleyebilirsin.
    </p>
  </div>
);

// ---------- LİG ODASI ----------
export const LigRoom: React.FC<RoomProps> = ({ userProfile, onOpenLeaderboard }) => {
  const [rows, setRows] = useState<Array<{ rank: number; name: string; title: string; rating: number; wins: number; mars: number }>>([]);
  useEffect(() => {
    let alive = true;
    cloudflareStorage.fetchLeaderboard().then(d => {
      if (alive) setRows(d.slice(0, 5));
    });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 px-4 py-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif-tavla font-black text-lg text-white">🏆 Kahvehane Ligi</h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
          ÇEVRİMDIŞI
        </span>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
        {rows.map(r => (
          <div key={r.rank} className="flex items-center gap-3 px-4 py-2.5 text-xs">
            <span className="font-black text-amber-300 w-6">#{r.rank}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">{r.name}</div>
              <div className="text-[10px] text-amber-200/60 truncate">{r.title}</div>
            </div>
            <span className="font-mono font-bold text-amber-300 tabular-nums">{r.rating}</span>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-amber-200/60">Sıralama yükleniyor...</div>
        )}
      </div>
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs text-center text-amber-200">
        Senin reytingin: <strong className="text-amber-300 tabular-nums">{userProfile.rating}P</strong> · {userProfile.stats.wins} galibiyet
      </div>
      {onOpenLeaderboard && (
        <button
          onClick={onOpenLeaderboard}
          className="w-full py-2.5 rounded-2xl bg-amber-500 text-stone-950 text-xs font-black active:scale-95"
        >
          🏆 TÜM LİG TABLOSU
        </button>
      )}
    </div>
  );
};

// ---------- PROFİL ODASI ----------
export const ProfilRoom: React.FC<RoomProps> = ({
  userProfile,
  onOpenProfile,
  onOpenStats,
  onOpenCustomization,
  onOpenAudioSettings,
}) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col gap-3 px-4 py-3">
    <h2 className="font-serif-tavla font-black text-lg text-white">👤 Profilim</h2>
    <div className="p-4 rounded-2xl border border-amber-500/30 bg-white/[0.04] flex items-center gap-4">
      <PlayerAvatar avatarUrl={userProfile.avatar} frameId={userProfile.frameId} size={56} />
      <div className="min-w-0">
        <div className="font-serif-tavla font-bold text-base text-[#fef3c7] truncate">{userProfile.name}</div>
        <div className="text-xs text-amber-400">{userProfile.title} (Seviye {userProfile.stats.level})</div>
        <div className="text-[11px] text-amber-200/70 tabular-nums">
          🪙 {formatCoins(userProfile.coins)} · ⭐ {userProfile.rating} · 🏆 {userProfile.stats.wins}G/{userProfile.stats.losses}M
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: 'Kariyer & Rozetler', icon: '👤', fn: onOpenProfile },
        { label: 'İstatistikler', icon: '📊', fn: onOpenStats },
        { label: 'Portre & Görünüm', icon: '🎭', fn: onOpenCustomization },
        { label: 'Ses & Hafif Mod', icon: '📻', fn: onOpenAudioSettings },
      ].map(b => (
        <button
          key={b.label}
          onClick={() => b.fn?.()}
          className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-left active:scale-95"
        >
          <span className="text-2xl">{b.icon}</span>
          <div className="font-bold text-white text-xs mt-1">{b.label}</div>
        </button>
      ))}
    </div>
    <a href="/privacy" target="_blank" rel="noreferrer" className="text-center text-[11px] text-amber-200/50 underline">
      Gizlilik Politikası
    </a>
  </div>
);
