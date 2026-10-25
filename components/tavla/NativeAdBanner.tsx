'use client';

import React, { useEffect } from 'react';
import { admobService } from '@/lib/admob/admobService';

interface NativeAdBannerProps {
  /** true → alt kenarda gerçek AdMob banner görünsün (yalnızca native Android/iOS) */
  visible: boolean;
}

/**
 * Tek example (singleton) native banner kontrolcüsü.
 * Web'de hiçbir şey çizmez (AdMob native overlay'tir); layout boşluğunu
 * admobService `--admob-banner-h` CSS değişkeniyle ayırır.
 */
const NativeAdBannerComponent: React.FC<NativeAdBannerProps> = ({ visible }) => {
  useEffect(() => {
    if (!admobService.isNativeAdMobAvailable()) return;
    let disposed = false;
    void (async () => {
      await admobService.initialize();
      if (disposed) return;
      if (visible) {
        await admobService.showBannerNative();
      } else {
        await admobService.hideBannerNative();
      }
    })();
    return () => {
      disposed = true;
    };
  }, [visible]);

  // Uygulama kapanırken/checkout'ta banner'i tamamen yok et
  useEffect(() => {
    if (!admobService.isNativeAdMobAvailable()) return;
    return () => {
      void admobService.removeBannerNative();
    };
  }, []);

  return null;
};

export const NativeAdBanner = React.memo(NativeAdBannerComponent);
