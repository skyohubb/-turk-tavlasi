'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BOARD_SKINS, BoardSkin, boardDiscountPrice } from '@/lib/tavla/customizationData';
import { cloudflareStorage, UserProfile } from '@/lib/cloudflare/storage';
import { soundEffects } from '@/lib/audio/soundEffects';
import { formatCoins } from '@/lib/format';
import { useToast } from '@/hooks/useToast';
import { SafeImage } from './SafeImage';
import { AdMobBanner } from './AdMobBanner';
import { RewardedAdModal } from './RewardedAdModal';
import { BOARD_DISCOUNT_TTL_MS } from '@/lib/tavla/customizationData';

interface BoardStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onOpenRewardedAd?: () => void;
}

export const BoardStoreModal: React.FC<BoardStoreModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenRewardedAd,
}) => {
  const activeSkinId = userProfile.boardSkinId || 'board_ceviz_klasik';
  const unlockedSkins = userProfile.unlockedBoardSkins || ['board_ceviz_klasik'];

  const [selectedSkinId, setSelectedSkinId] = useState<string>(activeSkinId);
  const { msg: toastMsg, show: triggerToast } = useToast(2800);
  // İndirim videosu akışı: hangi tahta için çek kazanılacak + modal açık mı
  const [discountSkinId, setDiscountSkinId] = useState<string | null>(null);
  const [isDiscountAdOpen, setIsDiscountAdOpen] = useState<boolean>(false);
  const [discountCooldown, setDiscountCooldown] = useState(() => cloudflareStorage.canWatchRewardedAd());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const selectedSkin =
    BOARD_SKINS.find(b => b.id === selectedSkinId) || BOARD_SKINS[0];

  const isUnlocked = unlockedSkins.includes(selectedSkin.id) || selectedSkin.requiredCoins === 0;
  const isEquipped = activeSkinId === selectedSkin.id;

  const handleEquip = (skin: BoardSkin) => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      boardSkinId: skin.id,
      unlockedBoardSkins: Array.from(new Set([...unlockedSkins, skin.id])),
    };
    cloudflareStorage.saveProfile(updatedProfile);
    soundEffects.playCheckerDrop();
    triggerToast(`✨ "${skin.name}" tahtası kuşandı ve masanıza yerleştirildi!`);
  };

  const handlePurchase = (skin: BoardSkin, priceOverride?: number) => {
    const price = priceOverride ?? skin.requiredCoins;
    if (userProfile.coins < price) {
      soundEffects.playCheckerHit();
      triggerToast(
        `Yetersiz Akçe! ${price} Akçe gereklidir. (Mevcut: ${userProfile.coins} Akçe)`
      );
      return;
    }

    const updatedCoins = userProfile.coins - price;
    const nextUnlocked = Array.from(new Set([...unlockedSkins, skin.id]));

    const updatedProfile: UserProfile = {
      ...userProfile,
      coins: updatedCoins,
      boardSkinId: skin.id,
      unlockedBoardSkins: nextUnlocked,
    };

    cloudflareStorage.saveProfile(updatedProfile);
    soundEffects.playCoinReward();
    triggerToast(`🎉 Tebrikler! "${skin.name}" el işçiliği tahtanız satın alındı ve kuşandı!`);
  };

  // Reklamlı indirim: videoyu izle → 10dk geçerli %50 çek kazan
  const handleOpenDiscountAd = (skin: BoardSkin) => {
    setDiscountSkinId(skin.id);
    setDiscountCooldown(cloudflareStorage.canWatchRewardedAd());
    setIsDiscountAdOpen(true);
  };

  const handleDiscountClaimed = (skinId: string) => {
    cloudflareStorage.stampAdWatched();
    cloudflareStorage.grantBoardDiscount(skinId, BOARD_DISCOUNT_TTL_MS);
    setDiscountCooldown(cloudflareStorage.canWatchRewardedAd());
    setIsDiscountAdOpen(false);
    const skin = BOARD_SKINS.find(b => b.id === skinId);
    triggerToast(
      `🎉 %50 indirim çeki kapıldı! "${skin?.name || 'Tahta'}" ${boardDiscountPrice(skin?.requiredCoins || 0)} akçeye düştü (10 dk).`
    );
  };

  const discountSkin = discountSkinId
    ? BOARD_SKINS.find(b => b.id === discountSkinId) || null
    : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl"
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#1c0f08] via-[#140a04] to-[#0c0502] border-2 border-amber-400/40 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.25)] overflow-hidden relative"
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
          <div className="relative z-10 p-3 sm:p-6 border-b border-white/[0.08] flex items-center justify-between gap-2 shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center text-lg sm:text-xl shrink-0">
                🪵
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif-tavla text-base sm:text-xl font-black text-[#fef3c7] tracking-tight truncate">
                    Tahta Atölyesi
                  </h2>
                  <span className="hidden xs:inline text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30 shrink-0">
                    Özel Tasarım
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-amber-200/70 truncate">
                  Osmanlı motifli, ceviz ve gül ağacı el işçiliği tahtalarla oyun zevkinizi taçlandırın
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* AdMob Rewarded Video Akçe Button */}
              {onOpenRewardedAd && (
                <button
                  onClick={onOpenRewardedAd}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 via-amber-400/30 to-amber-600/25 hover:from-amber-500/40 hover:to-amber-600/40 border border-amber-400/50 text-amber-200 hover:text-white text-xs font-serif-tavla font-bold flex items-center gap-1.5 transition-all shadow active:scale-95"
                  title="Video reklam izleyerek +500 altın akçe kazanın"
                >
                  <span className="text-sm animate-pulse">📺</span>
                  <span className="hidden xs:inline">+500 Akçe Kazan</span>
                  <span className="xs:hidden">+500</span>
                </button>
              )}

              {/* Coin Counter Pill (mobilde de görünür — kasanı bilerek al) */}
              <div className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow shrink-0">
                <span>🪙</span>
                <span suppressHydrationWarning className="tabular-nums font-black text-amber-100">
                  {formatCoins(userProfile.coins)}
                </span>
                <span className="text-[10px] uppercase text-amber-300/80 hidden xs:inline">Akçe</span>
              </div>

              {/* Prominent Header Close Button */}
              <button
                onClick={onClose}
                className="px-3 sm:px-3.5 py-1.5 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 hover:text-white border border-rose-400/50 text-xs font-serif-tavla font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                title="Mağazayı Kapat"
              >
                <span className="text-sm">✕</span>
                <span className="hidden xs:inline">Kapat</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-20 inset-x-4 sm:inset-x-20 z-50 p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-serif-tavla font-bold text-xs sm:text-sm text-center shadow-xl border border-white/40"
              >
                {toastMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Board Showcase / Preview */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl bg-[#0e0704] aspect-[16/10] flex flex-col justify-between p-3.5">
                {/* Background Image of Selected Board */}
                <div className="absolute inset-0">
                  <SafeImage
                    src={selectedSkin.previewImage}
                    alt={selectedSkin.name}
                    className="w-full h-full object-cover"
                    fallbackSrc="/images/tavla_board.jpg"
                    fallbackIcon="🪵"
                    fallbackText={selectedSkin.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
                </div>

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-200 border border-amber-400/40">
                    {selectedSkin.theme.accentBadge}
                  </span>
                  {isEquipped ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-stone-950 text-xs font-black shadow-lg animate-pulse flex items-center gap-1">
                      <span>✓</span>
                      <span>ŞU AN KULLANILIYOR</span>
                    </span>
                  ) : isUnlocked ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-semibold backdrop-blur-md">
                      Mülkiyetinizde
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black shadow-md tabular-nums">
                      🪙 {formatCoins(selectedSkin.requiredCoins)}
                    </span>
                  )}
                </div>
                {cloudflareStorage.hasBoardDiscount(selectedSkin.id) && !isUnlocked && (
                  <div className="relative z-10 mt-1.5 px-2.5 py-1 rounded-full bg-rose-500/25 text-rose-200 border border-rose-400/50 text-[11px] font-black tabular-nums animate-pulse w-fit">
                    📺 İndirimli: 🪙 {formatCoins(boardDiscountPrice(selectedSkin.requiredCoins))} (çek aktif!)
                  </div>
                )}

                {/* Center Motif Preview */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
                  <div className="px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 max-w-xs">
                    <span className="font-serif-tavla font-black text-sm tracking-widest text-amber-300 uppercase block">
                      {selectedSkin.theme.centerWatermark}
                    </span>
                    <span className="text-[10px] text-amber-100/70 block mt-0.5">
                      {selectedSkin.woodType}
                    </span>
                  </div>
                </div>

                {/* Bottom Spec Details */}
                <div className="relative z-10 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-amber-200/60 block text-[10px] uppercase font-bold">
                      Ağaç & İşleme
                    </span>
                    <span className="font-bold text-amber-100">{selectedSkin.woodType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Color Swatches */}
                    <div className="flex items-center gap-1">
                      <span
                        className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: selectedSkin.theme.pointDarkColor }}
                        title="Koyu Nokta Rengi"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: selectedSkin.theme.pointLightColor }}
                        title="Açık Nokta Rengi"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Selected Board */}
              <div className="flex flex-col gap-2">
                {isEquipped ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-serif-tavla font-black text-sm cursor-default flex items-center justify-center gap-2"
                  >
                    <span>✓</span>
                    <span>BU TAHTA OYUNDA AKTİF</span>
                  </button>
                ) : isUnlocked ? (
                  <button
                    onClick={() => handleEquip(selectedSkin)}
                    className="relative group w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-serif-tavla font-black text-sm tracking-wider shadow-[0_6px_25px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="absolute inset-x-4 top-1 h-[30%] rounded-full bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
                    <span>🪵</span>
                    <span>BU TAHTAYI KUŞAN & OYNA</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handlePurchase(selectedSkin)}
                      className="relative group w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif-tavla font-black text-sm tracking-wider shadow-[0_8px_30px_rgba(245,158,11,0.5)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="absolute inset-x-4 top-1 h-[30%] rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                      <span>🪙</span>
                      <span>{selectedSkin.requiredCoins} AKÇE İLE SATIN AL & KUŞAN</span>
                    </button>

                    {userProfile.coins < selectedSkin.requiredCoins && onOpenRewardedAd && (
                      <button
                        onClick={onOpenRewardedAd}
                        className="py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-amber-200/80 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                      >
                        <span>☕</span>
                        <span>Akçeniz yetersiz mi? Günün ikramını kabul ederek akçe kazanın</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* AdMob Banner under preview */}
              <AdMobBanner format="banner" initialCreativeIndex={1} className="shadow-lg border-amber-500/30" />
            </div>

            {/* Right: Board Catalog List */}
            <div className="lg:col-span-6 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300/80 px-1">
                Mevcut Ahşap & Osmanlı Koleksiyonu ({BOARD_SKINS.length})
              </span>

              <div className="space-y-3 pr-1">
                {BOARD_SKINS.map(skin => {
                  const isSkinUnlocked =
                    unlockedSkins.includes(skin.id) || skin.requiredCoins === 0;
                  const isSkinEquipped = activeSkinId === skin.id;
                  const isSelected = selectedSkinId === skin.id;

                  return (
                    <div
                      key={skin.id}
                      onClick={() => {
                        setSelectedSkinId(skin.id);
                        soundEffects.playCheckerDrop();
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 backdrop-blur-xl ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/50 shadow-lg'
                          : 'border-white/[0.08] bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-black shadow-md">
                          <SafeImage
                            src={skin.previewImage}
                            alt={skin.name}
                            className="w-full h-full object-cover"
                            fallbackSrc="/images/tavla_board.jpg"
                            fallbackIcon="🪵"
                            fallbackText={skin.name}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-serif-tavla font-bold text-sm text-[#fef3c7]">
                              {skin.name}
                            </span>
                            {isSkinEquipped && (
                              <span className="text-[9px] bg-emerald-500 text-stone-950 font-black px-1.5 py-0.2 rounded-full">
                                AKTİF
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-amber-300 font-medium block">
                            {skin.woodType}
                          </span>
                          <span className="text-[11px] text-[#a88a6d] line-clamp-1">
                            {skin.description}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
                        {isSkinUnlocked ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 block">
                            Açık
                          </span>
                        ) : cloudflareStorage.hasBoardDiscount(skin.id) ? (
                          <span className="text-xs font-black text-rose-200 bg-rose-500/25 px-2.5 py-1 rounded-full border border-rose-400/50 block tabular-nums animate-pulse">
                            %50 ÇEK AKTİF
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-200 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/40 block tabular-nums">
                            🪙 {formatCoins(skin.requiredCoins)}
                          </span>
                        )}
                        {!isSkinEquipped &&
                          (isSkinUnlocked ? (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleEquip(skin);
                              }}
                              className="px-3 py-1.5 rounded-xl font-serif-tavla text-[11px] font-black transition-all active:scale-95 shadow bg-emerald-500 hover:bg-emerald-400 text-stone-950"
                            >
                              KUŞAN
                            </button>
                          ) : cloudflareStorage.hasBoardDiscount(skin.id) ? (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handlePurchase(skin, boardDiscountPrice(skin.requiredCoins));
                              }}
                              className="px-3 py-1.5 rounded-xl font-serif-tavla text-[11px] font-black transition-all active:scale-95 shadow bg-gradient-to-r from-rose-500 to-amber-500 text-white tabular-nums"
                            >
                              🪙 {formatCoins(boardDiscountPrice(skin.requiredCoins))} AL
                            </button>
                          ) : (
                            <div className="flex flex-col gap-1 items-end">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handlePurchase(skin);
                                }}
                                className="px-3 py-1.5 rounded-xl font-serif-tavla text-[11px] font-black transition-all active:scale-95 shadow bg-white/10 hover:bg-white/20 text-amber-100 border border-white/20 tabular-nums"
                              >
                                🪙 {formatCoins(skin.requiredCoins)} AL
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleOpenDiscountAd(skin);
                                }}
                                className="px-3 py-1.5 rounded-xl font-serif-tavla text-[11px] font-black transition-all active:scale-95 shadow bg-amber-500 hover:bg-amber-400 text-stone-950 tabular-nums"
                              >
                                📺 {formatCoins(boardDiscountPrice(skin.requiredCoins))}
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AdMob Sponsor Dock Strip */}
          <div className="px-4 py-1 bg-black/40">
            <AdMobBanner format="dock_strip" className="shadow-none border-amber-500/25" />
          </div>

          {/* Sticky Footer Bar: seçili tahta işlemi + kapatma (hep görünür) */}
          <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-black/60 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
            <div className="text-xs text-amber-200/70 hidden md:block min-w-0">
              Seçili Tahta: <strong className="text-amber-300">{selectedSkin.name}</strong>
            </div>
            {!isEquipped && (
              <button
                onClick={() => {
                  if (isUnlocked) handleEquip(selectedSkin);
                  else if (cloudflareStorage.hasBoardDiscount(selectedSkin.id))
                    handlePurchase(selectedSkin, boardDiscountPrice(selectedSkin.requiredCoins));
                  else handlePurchase(selectedSkin);
                }}
                className={`px-4 sm:px-6 py-2.5 rounded-2xl font-serif-tavla text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 shrink-0 tabular-nums ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950'
                }`}
              >
                <span>{isUnlocked ? '🪵' : '🪙'}</span>
                <span>
                  {isUnlocked
                    ? 'KUŞAN'
                    : cloudflareStorage.hasBoardDiscount(selectedSkin.id)
                    ? `${formatCoins(boardDiscountPrice(selectedSkin.requiredCoins))} — İNDİRİMLİ AL`
                    : `${formatCoins(selectedSkin.requiredCoins)} — SATIN AL`}
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 rounded-2xl bg-gradient-to-r from-stone-800 to-stone-900 hover:from-rose-900/60 hover:to-rose-800/60 text-[#fef3c7] hover:text-white font-serif-tavla text-xs sm:text-sm font-bold border border-white/20 hover:border-rose-400/50 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ml-auto shrink-0"
            >
              <span>✕</span>
              <span className="hidden xs:inline">Pencereyi Kapat &amp; Lobiye Dön</span>
              <span className="xs:hidden">Kapat</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mağaza içi indirim videosu (kendi penceresidir, akçe vermez — çek verir) */}
      {discountSkin && (
        <RewardedAdModal
          isOpen={isDiscountAdOpen}
          onClose={() => setIsDiscountAdOpen(false)}
          onRewardClaimed={() => {}}
          userProfile={userProfile}
          cooldownStatus={discountCooldown}
          initialRewardType="coins"
          discountOffer={{
            skinId: discountSkin.id,
            skinName: discountSkin.name,
            normalPrice: discountSkin.requiredCoins,
            discountPrice: boardDiscountPrice(discountSkin.requiredCoins),
          }}
          onDiscountClaimed={handleDiscountClaimed}
        />
      )}
    </AnimatePresence>
  );
};
