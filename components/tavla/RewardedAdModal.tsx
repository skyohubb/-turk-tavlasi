'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdRewardType, AVAILABLE_REWARDS, admobService } from '@/lib/admob/admobService';
import { soundEffects } from '@/lib/audio/soundEffects';
import { formatCountdown } from '@/lib/format';
import { SafeImage } from './SafeImage';
import { UserProfile } from '@/lib/cloudflare/storage';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (rewardType: AdRewardType) => void;
  userProfile?: UserProfile;
  cooldownStatus?: { eligible: boolean; remainingSeconds: number; reason: string; dailyRemaining?: number };
  initialRewardType?: AdRewardType;
  // Mağaza indirimi modu: video karşılığı indirim çeki (akçe ödülü YOK)
  discountOffer?: { skinId: string; skinName: string; normalPrice: number; discountPrice: number };
  onDiscountClaimed?: (skinId: string) => void;
}

const RewardedAdModalContent: React.FC<Omit<RewardedAdModalProps, 'isOpen'>> = ({
  onClose,
  onRewardClaimed,
  userProfile,
  cooldownStatus,
  initialRewardType = 'coins',
  discountOffer,
  onDiscountClaimed,
}) => {
  const [selectedReward, setSelectedReward] = useState<AdRewardType>(initialRewardType);
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [isNativeLoading, setIsNativeLoading] = useState<boolean>(false);
  const [videoSecondsLeft, setVideoSecondsLeft] = useState<number>(15);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [rewardClaimedSuccess, setRewardClaimedSuccess] = useState<boolean>(false);
  const [abortMsg, setAbortMsg] = useState<string>('');
  const [activeCreative, setActiveCreative] = useState(() => admobService.getRandomCreative());
  const [localCooldownSec, setLocalCooldownSec] = useState<number>(cooldownStatus?.remainingSeconds ?? 0);
  const isNative = admobService.isNativeAdMobAvailable();

  // Live countdown timer for cooldown if active
  useEffect(() => {
    if (isWatchingAd || localCooldownSec <= 0) return;
    const interval = setInterval(() => {
      setLocalCooldownSec(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isWatchingAd, localCooldownSec]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isWatchingAd) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWatchingAd, onClose]);

  // Video Countdown effect (sadece web simülasyonu için)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isWatchingAd) {
      timer = setInterval(() => {
        setVideoSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer!);
            setIsWatchingAd(false);
            grantReward(selectedReward);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWatchingAd, selectedReward]);

  const isEligible = localCooldownSec <= 0 && (cooldownStatus?.eligible ?? true);
  const dailyRemaining = cooldownStatus?.dailyRemaining ?? 6;

  const grantReward = (reward: AdRewardType) => {
    // Mağaza indirimi modu: akçe YOK, indirim çeki var
    if (discountOffer && onDiscountClaimed) {
      setRewardClaimedSuccess(true);
      soundEffects.playDiceRoll();
      soundEffects.playCoinReward();
      onDiscountClaimed(discountOffer.skinId);
      setLocalCooldownSec(admobService.REWARDED_COOLDOWN_MS / 1000);
      return;
    }
    setRewardClaimedSuccess(true);
    soundEffects.playDiceRoll();
    soundEffects.playCoinReward();
    onRewardClaimed(reward);
    // Ödül alındı → sayaç baştan: yeni ödül için yeniden tam video şart
    setLocalCooldownSec(admobService.REWARDED_COOLDOWN_MS / 1000);
  };

  const handleStartWatchVideo = async () => {
    if (!isEligible || dailyRemaining <= 0 || isWatchingAd || isNativeLoading) return;
    setAbortMsg('');
    setRewardClaimedSuccess(false);

    // NATIVE (Android): GERÇEK reklam. Ödül SADECE tamamlanınca verilir (AdMob politikası).
    if (isNative) {
      setIsNativeLoading(true);
      const completed = await admobService.showRewardedNative();
      setIsNativeLoading(false);
      if (completed) {
        grantReward(selectedReward);
      } else {
        setAbortMsg('Video yarım kaldı, ödül verilmedi. Ödül için videoyu sonuna kadar izleyin.');
        soundEffects.playCheckerHit();
      }
      return;
    }

    // WEB: 15sn tanıtım simülasyonu (mağazada gerçek reklam gösterilir)
    setActiveCreative(admobService.getRandomCreative());
    setVideoSecondsLeft(15);
    setIsWatchingAd(true);
    soundEffects.playAuthenticTeaClink();
  };

  const formatSeconds = formatCountdown;

  return (
    <AnimatePresence>
      <div
        onClick={() => {
          if (!isWatchingAd) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl"
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#1f1008] via-[#160b05] to-[#120803] border-2 border-amber-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.2)] p-5 sm:p-6 overflow-hidden flex flex-col max-h-[92vh]"
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center text-xl shrink-0">
                {selectedReward === 'energy' ? '☕' : selectedReward === 'coins' ? '🪙' : '🎁'}
              </div>
              <div>
                <h2 className="font-serif-tavla text-base sm:text-lg font-bold text-[#fef3c7] leading-tight">
                  Sponsorlu Ödüllü Video
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-amber-200/70 mt-0.5">
                  <span className="text-amber-300 font-semibold">
                    {isNative ? 'Gerçek sponsor videosu' : '15sn tanıtım (web önizlemesi)'}
                  </span>
                  <span>·</span>
                  <span className="text-amber-200/90 font-mono">Günlük Kalan: {dailyRemaining}</span>
                </div>
              </div>
            </div>

            {!isWatchingAd && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 hover:text-white border border-rose-400/50 text-xs font-serif-tavla font-bold flex items-center gap-1.5 transition-all shadow active:scale-95 shrink-0"
                title="Kapat"
              >
                <span className="text-sm">✕</span>
                <span>Kapat</span>
              </button>
            )}
          </div>

          {/* ACTIVE VIDEO AD SIMULATOR */}
          {isWatchingAd ? (
            <div className="relative z-10 flex flex-col items-center justify-center rounded-2xl bg-black border-2 border-amber-500/40 overflow-hidden shadow-2xl p-4 my-auto">
              {/* Top video HUD */}
              <div className="w-full flex items-center justify-between mb-3 text-xs">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>📢</span>
                  <span>Sponsor Tanıtımı</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="p-1 px-2 rounded bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1"
                    title={isVideoMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                  >
                    <span>{isVideoMuted ? '🔇' : '🔊'}</span>
                    <span className="text-[10px]">{isVideoMuted ? 'Sessiz' : 'Sesli'}</span>
                  </button>
                  <div className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold font-mono text-xs flex items-center gap-1 shadow">
                    <span>⏱️</span>
                    <span>{videoSecondsLeft}s</span>
                  </div>
                </div>
              </div>

              {/* Video Simulated Stage */}
              <div className="relative w-full h-52 sm:h-56 rounded-xl overflow-hidden bg-gradient-to-t from-black via-[#1f1008] to-black flex items-center justify-center border border-white/10">
                <SafeImage
                  src={activeCreative.bannerImage}
                  alt={activeCreative.sponsorName}
                  className="w-full h-full object-cover opacity-85"
                  fallbackIcon={activeCreative.icon}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40" />

                <div className="absolute top-3 left-3 bg-black/60 px-2 py-0.5 rounded border border-white/10 text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                  Sponsor Yayını
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/30 border border-amber-400/60 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-lg">
                    {activeCreative.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider truncate">
                      {activeCreative.sponsorName}
                    </div>
                    <div className="font-serif-tavla font-bold text-sm sm:text-base text-white truncate">
                      {activeCreative.headline}
                    </div>
                    <div className="text-[11px] text-amber-200/80 truncate">
                      {activeCreative.tagline}
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-amber-200/70 font-semibold">
                  <span>Ödülünüzü almak için videoyu sonuna kadar izleyin...</span>
                  <span className="font-mono text-amber-300 font-bold">
                    %{Math.round(((15 - videoSecondsLeft) / 15) * 100)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden border border-white/15">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"
                    style={{ width: `${((15 - videoSecondsLeft) / 15) * 100}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* REWARD SELECTION & COOLDOWN VIEW */
            <div className="relative z-10 space-y-3.5 overflow-y-auto pr-1">
              {/* Success Banner if just claimed */}
              {rewardClaimedSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/25 border border-emerald-400/60 text-emerald-200 text-xs sm:text-sm font-serif-tavla font-bold text-center animate-bounce shadow">
                  {discountOffer
                    ? `🎉 İndirim çeki kapıldı! ${discountOffer.discountPrice} akçeye almak için mağazaya dön (10 dk geçerli).`
                    : '🎉 Tebrikler! Seçtiğiniz ödül hesabınıza başarıyla tanımlandı!'}
                </div>
              )}

              {/* Current Can / Energy & Coins Status Overview */}
              {userProfile && (
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-xs shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl drop-shadow">☕</span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-300/90 block">
                        MASA CANI (ENERJİ)
                      </span>
                      <span className="font-bold text-white tabular-nums text-sm">
                        {userProfile.energy} / {userProfile.maxEnergy} Fincan
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl drop-shadow">🪙</span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-300/90 block">
                        KASA BAKİYESİ
                      </span>
                      <span className="font-bold text-amber-300 tabular-nums text-sm">
                        {userProfile.coins} Akçe
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cooldown Alert if not eligible */}
              {!isEligible && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/35 text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                    <span className="animate-spin text-base">⏳</span>
                    <span>Ustanın İkram Molası ({formatSeconds(localCooldownSec)})</span>
                  </div>
                  <p className="text-[11px] text-amber-100/80 leading-relaxed">
                    Reklamların oyuncuları sıkmaması için ikramlar 3 dakikalık aralıklarla yenilenir.
                    <br />
                    <span className="text-amber-300 font-semibold">
                      💡 İpucu: Masada 1 maç bitirdiğinizde veya canınız 0 fincana düştüğünde bekleme yapmadan hemen izleyebilirsiniz!
                    </span>
                  </p>
                </div>
              )}

              {/* Heading for Reward Selection */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-black tracking-wider text-amber-300/90 font-serif-tavla">
                  {discountOffer
                    ? 'Videoyu Tam İzle → İndirimi Kap:'
                    : 'İkramı Seç → Videoyu Tam İzle → Ödülü Al:'}
                </span>
                <span className="text-[10px] text-amber-200/60 font-mono">
                  1 video = 1 ödül
                </span>
              </div>

              {/* Mağaza indirim teklifi kartı */}
              {discountOffer ? (
                <div className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/40 shadow-lg">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl">🪵</span>
                      <div className="font-serif-tavla font-bold text-xs sm:text-sm text-white truncate">
                        {discountOffer.skinName}
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white border border-rose-300 shrink-0">
                      %50 İndirim
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-3 py-1.5">
                    <span className="text-sm text-white/50 line-through tabular-nums">
                      🪙 {discountOffer.normalPrice}
                    </span>
                    <span className="text-lg">→</span>
                    <span className="text-xl font-black text-amber-300 tabular-nums">
                      🪙 {discountOffer.discountPrice}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100/70 leading-snug text-center">
                    Video bitince indirim çeki 10 dakika geçerli olur. İndirimli fiyatla almak için mağazaya dön.
                  </p>
                </div>
              ) : (
              /* Rewards List */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_REWARDS.map(r => {
                  const isSelected = selectedReward === r.type;
                  return (
                    <div
                      key={r.type}
                      onClick={() => setSelectedReward(r.type)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/25 ring-2 ring-amber-400/60 shadow-lg scale-[1.01]'
                          : 'border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{r.icon}</span>
                          <div>
                            <div className="font-serif-tavla font-bold text-xs sm:text-sm text-white">
                              {r.label}
                            </div>
                            <span className="text-[10px] text-amber-300 font-bold bg-black/40 px-1.5 py-0.2 rounded border border-amber-400/30">
                              {r.amount}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400 text-stone-950'
                              : 'border-white/20 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                      </div>
                      <p className="text-[11px] text-amber-100/70 leading-snug">
                        {r.description}
                      </p>
                    </div>
                  );
                })}
              </div>
              )}

              {/* Bottom Action Bar */}
              <div className="pt-3 border-t border-white/[0.08] space-y-2">
                {abortMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-[11px] font-bold text-center">
                    {abortMsg}
                  </div>
                )}
                <p className="text-[10px] text-amber-200/60 text-center leading-relaxed">
                  Ödül, video tamamlanınca hesabına eklenir. Yarım bırakılırsa ödül verilmez.
                  Her ödül için yeni bir video izlenir.
                </p>
                <div className="flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-amber-200/80 hover:text-white font-serif-tavla text-xs font-bold transition-colors"
                >
                  ✕ Kapat
                </button>

                <button
                  onClick={handleStartWatchVideo}
                  disabled={!isEligible || dailyRemaining <= 0 || isNativeLoading}
                  className={`px-6 py-2.5 rounded-full font-serif-tavla font-black text-xs sm:text-sm tracking-wider shadow-lg transition-all flex items-center gap-2 ${
                    isEligible && dailyRemaining > 0 && !isNativeLoading
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 cursor-pointer hover:scale-105 active:scale-95 border border-amber-300 shadow-amber-500/30'
                      : 'bg-white/[0.05] text-white/35 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <span>📺</span>
                  <span>
                    {isNativeLoading
                      ? 'REKLAM AÇILIYOR...'
                      : !isEligible
                      ? `SONRAKİ İKRAM: ${formatSeconds(localCooldownSec)}`
                      : dailyRemaining <= 0
                      ? 'GÜNLÜK LİMİT DOLDU'
                      : discountOffer
                      ? `İZLE → %50 İNDİRİMİ KAP (${discountOffer.discountPrice} 🪙)`
                      : selectedReward === 'energy'
                      ? 'İZLE → CANI (5/5) AL'
                      : selectedReward === 'coins'
                      ? 'İZLE → 500 AKÇE AL'
                      : 'İZLE → ÖDÜLÜ AL'}
                  </span>
                </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const RewardedAdModal: React.FC<RewardedAdModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <RewardedAdModalContent {...props} />;
};
