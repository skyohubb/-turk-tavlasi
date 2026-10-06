'use client';

import React, { useState } from 'react';
import { SPONSORED_CREATIVES, AdMobCreative } from '@/lib/admob/admobService';
import { SafeImage } from './SafeImage';

interface AdMobBannerProps {
  format?: 'banner' | 'inline_card' | 'dock_strip';
  className?: string;
  onAdClick?: (creative: AdMobCreative) => void;
  initialCreativeIndex?: number;
}

const AdMobBannerComponent: React.FC<AdMobBannerProps> = ({
  format = 'banner',
  className = '',
  onAdClick,
  initialCreativeIndex = 0,
}) => {
  const [creativeIndex] = useState<number>(() => initialCreativeIndex % SPONSORED_CREATIVES.length);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [clickToast, setClickToast] = useState<string>('');

  const creative = SPONSORED_CREATIVES[creativeIndex] || SPONSORED_CREATIVES[0];

  const handleClick = () => {
    if (onAdClick) {
      onAdClick(creative);
    }
    setClickToast(`${creative.sponsorName} açılıyor...`);
    setTimeout(() => setClickToast(''), 3000);
  };

  if (isDismissed) {
    return (
      <div className="w-full flex justify-center py-1">
        <button
          onClick={() => setIsDismissed(false)}
          className="text-[10px] text-amber-300/60 hover:text-amber-200 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10 transition-colors flex items-center gap-1"
        >
          <span>📢 Tanıtımı Göster</span>
        </button>
      </div>
    );
  }

  if (format === 'dock_strip') {
    return (
      <div className={`relative w-full max-w-lg mx-auto py-1 px-3 rounded-2xl bg-gradient-to-r from-[#1b0e06] via-[#231208] to-[#1b0e06] border border-amber-400/30 shadow-md flex items-center justify-between gap-2 overflow-hidden ${className}`}>
        {/* Sponsor indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
            Sponsor
          </span>
          <span className="text-base">{creative.icon}</span>
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
          <div className="text-xs font-bold text-white truncate font-serif-tavla">
            {creative.headline}
          </div>
          <div className="text-[10px] text-amber-200/70 truncate">
            {creative.sponsorName} · {creative.tagline}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleClick}
            className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif-tavla text-[10px] font-black transition-all active:scale-95"
          >
            {creative.ctaText}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="w-5 h-5 rounded-full text-[10px] text-white/40 hover:text-white flex items-center justify-center transition-colors"
            title="Gizle"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (format === 'inline_card') {
    return (
      <div className={`relative w-full rounded-3xl overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-[#231208] via-[#180c05] to-[#100703] shadow-[0_8px_25px_rgba(0,0,0,0.6)] p-4 sm:p-5 ${className}`}>
        {/* Sponsor Badge */}
        <div className="absolute top-2.5 right-3 flex items-center gap-1.5 z-20">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-[9px] uppercase tracking-wider text-amber-200/60 hover:text-amber-200 px-1.5 py-0.5 rounded bg-black/50 border border-white/10 flex items-center gap-1"
            title="Sponsor Bilgisi"
          >
            <span>Sponsor</span>
            <span className="text-[8px] opacity-70">ℹ️</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="w-5 h-5 rounded-full bg-black/50 text-amber-200/60 hover:text-white text-xs flex items-center justify-center border border-white/10"
            title="Kapat"
          >
            ✕
          </button>
        </div>

        {/* Sponsor Info Dropdown */}
        {showInfo && (
          <div className="absolute top-8 right-3 z-30 w-64 p-2.5 rounded-xl bg-[#120703] border border-amber-400/40 text-[10px] text-amber-200/80 shadow-2xl space-y-1">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Sponsorlu Tanıtım</span>
              <span className="text-[9px] text-emerald-400">Aktif</span>
            </div>
            <p className="text-white/70">Kahvehane müdavimlerine özel seçkin marka önerileri ve ikramlar.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-[#140b05] shrink-0 shadow-lg relative">
            <SafeImage
              src={creative.bannerImage}
              alt={creative.sponsorName}
              className="w-full h-full object-cover"
              fallbackIcon={creative.icon}
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/70 text-center py-0.5 text-[9px] text-amber-300 font-bold">
              ★ {creative.rating}
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                {creative.sponsorName}
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">
                {creative.badgeText}
              </span>
            </div>
            <h4 className="font-serif-tavla font-black text-sm sm:text-base text-white leading-snug">
              {creative.headline}
            </h4>
            <p className="text-xs text-amber-100/75 mt-1 leading-relaxed">
              {creative.tagline}
            </p>
          </div>

          <button
            onClick={handleClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif-tavla font-black text-xs sm:text-sm tracking-wider shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2 border border-amber-300"
          >
            <span>{creative.icon}</span>
            <span>{creative.ctaText}</span>
          </button>
        </div>

        {clickToast && (
          <div className="mt-2 text-center text-xs text-emerald-300 font-semibold bg-emerald-500/20 py-1 rounded-xl border border-emerald-400/30">
            ✓ {clickToast}
          </div>
        )}
      </div>
    );
  }

  // Standard responsive banner (320x50 mobile / 728x90 desktop)
  return (
    <div className={`relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-[#170a04] via-[#24130a] to-[#170a04] shadow-md px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 ${className}`}>
      {/* Sponsor indicator top-left */}
      <div className="absolute top-1 left-2 flex items-center gap-1 z-10 pointer-events-none">
        <span className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-black/70 text-amber-300/80 border border-white/10">
          Sponsor
        </span>
      </div>

      <div className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer pt-2 sm:pt-0" onClick={handleClick}>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-400/40 bg-black shrink-0 relative">
          <SafeImage
            src={creative.bannerImage}
            alt={creative.sponsorName}
            className="w-full h-full object-cover"
            fallbackIcon={creative.icon}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 truncate">
              {creative.sponsorName}
            </span>
            <span className="text-[9px] text-amber-300/60 hidden sm:inline">
              · {creative.category}
            </span>
          </div>
          <div className="font-serif-tavla font-bold text-xs sm:text-sm text-white truncate">
            {creative.headline}
          </div>
          <div className="text-[10px] text-amber-200/70 truncate hidden md:block">
            {creative.tagline}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
        <button
          onClick={handleClick}
          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif-tavla font-black text-xs tracking-wider shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
        >
          <span>{creative.ctaText}</span>
          <span className="text-xs">↗</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="w-6 h-6 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-amber-200/60 hover:text-white flex items-center justify-center text-xs transition-colors"
          title="Kapat"
        >
          ✕
        </button>
      </div>

      {clickToast && (
        <div className="absolute inset-0 bg-[#120703]/95 z-20 flex items-center justify-center text-xs text-amber-200 font-bold">
          {clickToast}
        </div>
      )}
    </div>
  );
};

export const AdMobBanner = React.memo(AdMobBannerComponent);

