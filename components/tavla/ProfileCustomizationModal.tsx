'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  COFFEEHOUSE_AVATARS,
  AVATAR_FRAMES,
  BOARD_SKINS,
  AvatarStyle,
  AvatarFrame,
  BoardSkin,
} from '@/lib/tavla/customizationData';
import { cloudflareStorage, UserProfile } from '@/lib/cloudflare/storage';
import { soundEffects } from '@/lib/audio/soundEffects';
import { PlayerAvatar } from './PlayerAvatar';
import { SafeImage } from './SafeImage';
import { AdMobBanner } from './AdMobBanner';

interface ProfileCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

const ProfileCustomizationModalContent: React.FC<{
  onClose: () => void;
  userProfile: UserProfile;
}> = ({ onClose, userProfile }) => {
  const [activeTab, setActiveTab] = useState<'avatars' | 'frames' | 'boards'>('avatars');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    userProfile.avatarId || 'tavla_cirak'
  );
  const [selectedFrameId, setSelectedFrameId] = useState<string>(
    userProfile.frameId || 'frame_classic_wood'
  );
  const [selectedBoardSkinId, setSelectedBoardSkinId] = useState<string>(
    userProfile.boardSkinId || 'board_ceviz_klasik'
  );
  const [customName, setCustomName] = useState<string>(userProfile.name);
  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const unlockedAvatars = userProfile.unlockedAvatars || ['tavla_cirak', 'cayci_rustem'];
  const unlockedFrames = userProfile.unlockedFrames || ['frame_classic_wood'];
  const unlockedBoardSkins = userProfile.unlockedBoardSkins || ['board_ceviz_klasik'];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(prev => (prev === msg ? '' : prev));
    }, 2800);
  };

  const handleSelectAvatar = (av: AvatarStyle) => {
    const isUnlocked =
      unlockedAvatars.includes(av.id) ||
      userProfile.stats.level >= av.requiredLevel;

    if (isUnlocked) {
      setSelectedAvatarId(av.id);
      soundEffects.playCheckerDrop();
    } else {
      triggerToast(
        `Bu şahsiyet için Seviye ${av.requiredLevel} veya ${av.requiredCoins} Akçe gereklidir!`
      );
    }
  };

  const handleUnlockAvatar = (av: AvatarStyle) => {
    if (userProfile.coins < av.requiredCoins) {
      triggerToast(`Yetersiz Akçe! ${av.requiredCoins} Akçe gereklidir.`);
      return;
    }

    const updatedCoins = userProfile.coins - av.requiredCoins;
    const nextUnlocked = Array.from(new Set([...unlockedAvatars, av.id]));

    const updatedProfile: UserProfile = {
      ...userProfile,
      coins: updatedCoins,
      unlockedAvatars: nextUnlocked,
      avatarId: av.id,
      avatar: av.avatarUrl,
      title: av.title,
    };

    cloudflareStorage.saveProfile(updatedProfile);
    setSelectedAvatarId(av.id);
    soundEffects.playCoinReward();
    triggerToast(`🎉 "${av.name}" portresi başarıyla açıldı ve kuşandı!`);
  };

  const handleSelectFrame = (fr: AvatarFrame) => {
    const isUnlocked =
      unlockedFrames.includes(fr.id) ||
      (userProfile.stats.wins >= fr.requiredWins &&
        userProfile.stats.marsWins >= fr.requiredMars);

    if (isUnlocked) {
      setSelectedFrameId(fr.id);
      soundEffects.playCheckerDrop();
    } else {
      triggerToast(
        `Bu çerçeve için ${fr.requiredWins} Galibiyet ve ${fr.requiredMars} Mars gerekir!`
      );
    }
  };

  const handleUnlockFrame = (fr: AvatarFrame) => {
    if (userProfile.coins < fr.requiredCoins) {
      triggerToast(`Yetersiz Akçe! ${fr.requiredCoins} Akçe gereklidir.`);
      return;
    }

    const updatedCoins = userProfile.coins - fr.requiredCoins;
    const nextUnlocked = Array.from(new Set([...unlockedFrames, fr.id]));

    const updatedProfile: UserProfile = {
      ...userProfile,
      coins: updatedCoins,
      unlockedFrames: nextUnlocked,
      frameId: fr.id,
    };

    cloudflareStorage.saveProfile(updatedProfile);
    setSelectedFrameId(fr.id);
    soundEffects.playCoinReward();
    triggerToast(`✨ "${fr.name}" çerçevesi açıldı ve kuşandı!`);
  };

  const handleSelectBoard = (skin: BoardSkin) => {
    const isUnlocked =
      unlockedBoardSkins.includes(skin.id) || skin.requiredCoins === 0;

    if (isUnlocked) {
      setSelectedBoardSkinId(skin.id);
      soundEffects.playCheckerDrop();
    } else {
      triggerToast(`Bu tahta için ${skin.requiredCoins} Akçe gereklidir!`);
    }
  };

  const handleUnlockBoard = (skin: BoardSkin) => {
    if (userProfile.coins < skin.requiredCoins) {
      soundEffects.playCheckerHit();
      triggerToast(`Yetersiz Akçe! ${skin.requiredCoins} Akçe gereklidir.`);
      return;
    }

    const updatedCoins = userProfile.coins - skin.requiredCoins;
    const nextUnlocked = Array.from(new Set([...unlockedBoardSkins, skin.id]));

    const updatedProfile: UserProfile = {
      ...userProfile,
      coins: updatedCoins,
      boardSkinId: skin.id,
      unlockedBoardSkins: nextUnlocked,
    };

    cloudflareStorage.saveProfile(updatedProfile);
    setSelectedBoardSkinId(skin.id);
    soundEffects.playCoinReward();
    triggerToast(`🎉 "${skin.name}" el işçiliği tahtası satın alındı ve kuşandı!`);
  };

  const handleSaveProfile = () => {
    const activeAvatar =
      COFFEEHOUSE_AVATARS.find(a => a.id === selectedAvatarId) ||
      COFFEEHOUSE_AVATARS[0];

    const updatedProfile: UserProfile = {
      ...userProfile,
      name: customName.trim() || userProfile.name,
      avatarId: selectedAvatarId,
      avatar: activeAvatar.avatarUrl,
      frameId: selectedFrameId,
      boardSkinId: selectedBoardSkinId,
      title: activeAvatar.title,
    };

    cloudflareStorage.saveProfile(updatedProfile);
    soundEffects.playCoinReward();
    onClose();
  };

  const previewAvatar =
    COFFEEHOUSE_AVATARS.find(a => a.id === selectedAvatarId) ||
    COFFEEHOUSE_AVATARS[0];

  const getRarityBadge = (rarity: AvatarFrame['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return (
          <span className="text-[10px] text-[#34d399] font-bold bg-[#064e3b]/60 px-2 py-0.5 rounded border border-[#10b981]/50 shadow-sm">
            Efsanevi
          </span>
        );
      case 'epic':
        return (
          <span className="text-[10px] text-[#f472b6] font-bold bg-[#831843]/50 px-2 py-0.5 rounded border border-[#f472b6]/40 shadow-sm">
            Epik
          </span>
        );
      case 'rare':
        return (
          <span className="text-[10px] text-[#38bdf8] font-bold bg-[#0c4a6e]/50 px-2 py-0.5 rounded border border-[#38bdf8]/40 shadow-sm">
            Nadir
          </span>
        );
      default:
        return (
          <span className="text-[10px] text-[#d1ba9f] font-bold bg-[#29170e] px-2 py-0.5 rounded border border-[#78350f]/40">
            Klasik
          </span>
        );
    }
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
          className="relative w-full max-w-3xl rounded-3xl bg-gradient-to-b from-[#1e1008] via-[#140a04] to-[#0c0502] border-2 border-amber-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.2)] p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col"
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
              <span className="text-2xl">🎭</span>
              <div>
                <h2 className="font-serif-tavla text-base sm:text-lg font-bold text-[#fef3c7]">
                  Kahvehane Şahsiyetleri &amp; Portre Özelleştirme
                </h2>
                <p className="text-xs text-amber-200/60">
                  Otantik kahvehane tarzınızı seçin, kilitli çerçevelerle masada heybetinizi gösterin.
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

          {/* Quick Toast feedback */}
          {toastMsg && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-[#2e1a0f] border border-[#d97706] text-xs text-[#fbbf24] text-center font-medium shadow-lg animate-bounce">
              {toastMsg}
            </div>
          )}

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5">
            {/* Live Portrait Preview Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#29160d] via-[#1a0e07] to-[#29160d] border border-[#542d17] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-4">
                <PlayerAvatar
                  avatarUrl={previewAvatar.avatarUrl}
                  frameId={selectedFrameId}
                  size={68}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      maxLength={22}
                      className="font-serif-tavla font-bold text-sm sm:text-base text-[#fef3c7] bg-[#140b05] border border-[#3b1f10] rounded-lg px-2.5 py-1 focus:border-[#fbbf24] outline-none"
                      placeholder="Oyuncu Adı"
                    />
                    <span className="text-xs text-[#d97706]" title="Adınızı değiştirebilirsiniz">✏️</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#fbbf24] font-medium">
                      {previewAvatar.title}
                    </span>
                    <span className="text-[10px] text-[#a88a6d] bg-[#140b05] px-2 py-0.5 rounded border border-[#3b1f10]">
                      {previewAvatar.personalityTrait}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#a88a6d]">
                <div className="bg-[#140b05] px-3.5 py-2 rounded-xl border border-[#3b1f10] text-center">
                  <span className="block text-[9px] uppercase font-bold text-[#a88a6d]">Mevcut Akçe</span>
                  <span className="font-bold text-[#fbbf24] text-sm tabular-nums">
                    🪙 {userProfile.coins}
                  </span>
                </div>
                <div className="bg-[#140b05] px-3.5 py-2 rounded-xl border border-[#3b1f10] text-center">
                  <span className="block text-[9px] uppercase font-bold text-[#a88a6d]">Usta Seviyesi</span>
                  <span className="font-bold text-[#fef3c7] text-sm tabular-nums">
                    Seviye {userProfile.stats.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-tabs: Avatars vs Frames */}
            <div className="flex items-center gap-2 border-b border-[#3b1f10] pb-2">
              <button
                onClick={() => setActiveTab('avatars')}
                className={`px-4 py-2.5 rounded-xl font-serif-tavla text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'avatars'
                    ? 'bg-[#d97706] text-[#120b07] shadow-lg ring-2 ring-[#fbbf24]/50'
                    : 'bg-[#140b05] text-[#d1ba9f] hover:text-white'
                }`}
              >
                <span>☕</span>
                <span>Kahvehane Şahsiyetleri ({COFFEEHOUSE_AVATARS.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('frames')}
                className={`px-4 py-2.5 rounded-xl font-serif-tavla text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'frames'
                    ? 'bg-[#d97706] text-[#120b07] shadow-lg ring-2 ring-[#fbbf24]/50'
                    : 'bg-[#140b05] text-[#d1ba9f] hover:text-white'
                }`}
              >
                <span>👑</span>
                <span>Sedef & Altın Çerçeveler ({AVATAR_FRAMES.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('boards')}
                className={`px-4 py-2.5 rounded-xl font-serif-tavla text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'boards'
                    ? 'bg-[#d97706] text-[#120b07] shadow-lg ring-2 ring-[#fbbf24]/50'
                    : 'bg-[#140b05] text-[#d1ba9f] hover:text-white'
                }`}
              >
                <span>🪵</span>
                <span>Tavla Tahtaları ({BOARD_SKINS.length})</span>
              </button>
            </div>

            {/* TAB 1: Avatars Roster */}
            {activeTab === 'avatars' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {COFFEEHOUSE_AVATARS.map(av => {
                  const isSelected = selectedAvatarId === av.id;
                  const isUnlocked =
                    unlockedAvatars.includes(av.id) ||
                    userProfile.stats.level >= av.requiredLevel;

                  return (
                    <div
                      key={av.id}
                      onClick={() => isUnlocked && handleSelectAvatar(av)}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#fbbf24] bg-[#2a170e] ring-2 ring-[#fbbf24]/60 shadow-lg'
                          : 'border-[#3b1f10] bg-[#140b05] hover:border-[#78350f]'
                      } ${isUnlocked ? 'cursor-pointer' : 'opacity-90'}`}
                    >
                      <div className="flex items-start gap-3 mb-2.5">
                        <PlayerAvatar
                          avatarUrl={av.avatarUrl}
                          frameId={selectedFrameId}
                          size={52}
                          showBadge={false}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-serif-tavla font-bold text-sm text-[#fef3c7] truncate">
                              {av.name}
                            </span>
                            {isUnlocked ? (
                              <span className="text-[10px] text-[#10b981] font-bold bg-[#064e3b]/50 px-2 py-0.5 rounded border border-[#10b981]/40 shrink-0">
                                {isSelected ? '✓ SEÇİLİ' : 'AÇIK'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#fbbf24] font-bold bg-[#451a03] px-2 py-0.5 rounded border border-[#b45309] shrink-0">
                                🔒 KİLİTLİ
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#d97706] block font-medium">
                            {av.title}
                          </span>
                          <span className="inline-block text-[10px] text-[#fbbf24]/90 bg-[#29170e] px-1.5 py-0.5 rounded mt-1 border border-[#542d17]">
                            ⚡ {av.personalityTrait}
                          </span>
                          <p className="text-[11px] text-[#a88a6d] leading-snug mt-1.5 line-clamp-2">
                            {av.description}
                          </p>
                        </div>
                      </div>

                      {/* Unlock Action if Locked */}
                      {!isUnlocked && (
                        <div className="mt-2 pt-2 border-t border-[#3b1f10] flex items-center justify-between text-xs">
                          <span className="text-[#a88a6d] text-[10px]">
                            Seviye {av.requiredLevel} ile açılır
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleUnlockAvatar(av);
                            }}
                            className="px-3 py-1 rounded-lg bg-[#d97706] hover:bg-[#f59e0b] text-[#120b07] font-serif-tavla text-xs font-bold transition-all shadow"
                          >
                            🪙 {av.requiredCoins} Akçe ile Kuşan
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Avatar Frames */}
            {activeTab === 'frames' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {AVATAR_FRAMES.map(fr => {
                  const isSelected = selectedFrameId === fr.id;
                  const isUnlocked =
                    unlockedFrames.includes(fr.id) ||
                    (userProfile.stats.wins >= fr.requiredWins &&
                      userProfile.stats.marsWins >= fr.requiredMars);

                  return (
                    <div
                      key={fr.id}
                      onClick={() => isUnlocked && handleSelectFrame(fr)}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#fbbf24] bg-[#2a170e] ring-2 ring-[#fbbf24]/60 shadow-lg'
                          : 'border-[#3b1f10] bg-[#140b05] hover:border-[#78350f]'
                      } ${isUnlocked ? 'cursor-pointer' : 'opacity-90'}`}
                    >
                      <div className="flex items-start gap-3 mb-2.5">
                        <PlayerAvatar
                          avatarUrl={previewAvatar.avatarUrl}
                          frameId={fr.id}
                          size={52}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-serif-tavla font-bold text-sm text-[#fef3c7] truncate">
                              {fr.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {getRarityBadge(fr.rarity)}
                              {isUnlocked ? (
                                <span className="text-[10px] text-[#10b981] font-bold bg-[#064e3b]/50 px-2 py-0.5 rounded border border-[#10b981]/40">
                                  {isSelected ? '✓ SEÇİLİ' : 'AÇIK'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#fbbf24] font-bold bg-[#451a03] px-2 py-0.5 rounded border border-[#b45309]">
                                  🔒 KİLİTLİ
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#a88a6d] leading-snug mt-1.5">
                            {fr.description}
                          </p>
                        </div>
                      </div>

                      {/* Unlock Action if Locked */}
                      {!isUnlocked && (
                        <div className="mt-2 pt-2 border-t border-[#3b1f10] flex items-center justify-between text-xs">
                          <span className="text-[#a88a6d] text-[10px]">
                            {fr.requiredWins} Galibiyet & {fr.requiredMars} Mars
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleUnlockFrame(fr);
                            }}
                            className="px-3 py-1 rounded-lg bg-[#d97706] hover:bg-[#f59e0b] text-[#120b07] font-serif-tavla text-xs font-bold transition-all shadow"
                          >
                            🪙 {fr.requiredCoins} Akçe ile Kuşan
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: Custom Backgammon Boards (Osmanlı & Özel Ahşaplar) */}
            {activeTab === 'boards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {BOARD_SKINS.map(skin => {
                  const isSelected = selectedBoardSkinId === skin.id;
                  const isUnlocked =
                    unlockedBoardSkins.includes(skin.id) || skin.requiredCoins === 0;

                  return (
                    <div
                      key={skin.id}
                      onClick={() => isUnlocked && handleSelectBoard(skin)}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#fbbf24] bg-[#2a170e] ring-2 ring-[#fbbf24]/60 shadow-lg'
                          : 'border-[#3b1f10] bg-[#140b05] hover:border-[#78350f]'
                      } ${isUnlocked ? 'cursor-pointer' : 'opacity-90'}`}
                    >
                      <div>
                        {/* Preview Image */}
                        <div className="relative w-full h-28 rounded-xl overflow-hidden mb-2.5 border border-white/10 bg-black">
                          <SafeImage
                            src={skin.previewImage}
                            alt={skin.name}
                            className="w-full h-full object-cover"
                            fallbackSrc="/images/tavla_board.jpg"
                            fallbackIcon="🪵"
                            fallbackText={skin.name}
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-200 border border-amber-400/40">
                            {skin.theme.accentBadge}
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-black">
                              SEÇİLİ
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-serif-tavla font-bold text-sm text-[#fef3c7]">
                            {skin.name}
                          </span>
                          {isUnlocked ? (
                            <span className="text-[10px] text-[#10b981] font-bold bg-[#064e3b]/50 px-2 py-0.5 rounded border border-[#10b981]/40 shrink-0">
                              {isSelected ? '✓ KUŞANILDI' : 'AÇIK'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#fbbf24] font-bold bg-[#451a03] px-2 py-0.5 rounded border border-[#b45309] shrink-0">
                              🔒 🪙 {skin.requiredCoins}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-amber-400 block font-medium mb-1">
                          {skin.woodType}
                        </span>
                        <p className="text-xs text-[#a88a6d] line-clamp-2 leading-relaxed">
                          {skin.description}
                        </p>
                      </div>

                      {/* Unlock Action */}
                      {!isUnlocked && (
                        <div className="pt-3 border-t border-[#3b1f10] mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-[#d1ba9f]">
                            🪙 {skin.requiredCoins} Akçe
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleUnlockBoard(skin);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-[#120b07] font-serif-tavla text-xs font-bold transition-all shadow"
                          >
                            Satın Al & Kuşan
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AdMob Sponsor Dock Strip */}
          <div className="pt-2 px-1">
            <AdMobBanner format="dock_strip" className="shadow-none border-amber-500/20" />
          </div>

          {/* Footer Save & Confirm Button */}
          <div className="pt-4 border-t border-[#3b1f10] mt-4 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1c0f08] hover:bg-[#2e1a0f] text-[#a88a6d] font-serif-tavla text-xs transition-colors"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] text-[#120b07] font-serif-tavla font-bold text-xs sm:text-sm tracking-wider shadow-lg hover:shadow-[#f59e0b]/40 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>💾</span>
              <span>PORTREYİ KAYDET & KUŞAN</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const ProfileCustomizationModal: React.FC<ProfileCustomizationModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  if (!isOpen) return null;

  return (
    <ProfileCustomizationModalContent
      onClose={onClose}
      userProfile={userProfile}
    />
  );
};

