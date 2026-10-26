'use client';

export type AdRewardType = 'coins' | 'energy' | 'reroll' | 'time';

export interface AdRewardInfo {
  type: AdRewardType;
  label: string;
  description: string;
  icon: string;
  amount: string;
}

export interface AdMobCreative {
  id: string;
  sponsorName: string;
  headline: string;
  tagline: string;
  ctaText: string;
  icon: string;
  bannerImage: string;
  rating: number;
  badgeText: string;
  category: string;
}

export const AVAILABLE_REWARDS: AdRewardInfo[] = [
  {
    type: 'coins',
    label: '500 Altın Akçe',
    description: 'Özel ceviz ve sedef kakma tahtalar açmak için anında akçe kazan.',
    icon: '🪙',
    amount: '+500 Akçe',
  },
  {
    type: 'energy',
    label: 'Demli Çay (Can)',
    description: 'Masa enerjini tamamen yenile (5/5), kesintisiz oyna.',
    icon: '☕',
    amount: 'Tam Can (5/5)',
  },
  {
    type: 'reroll',
    label: 'Uğurlu Zar Hakkı',
    description: 'Kritik anda ters gelen zarları maçta 1 kez yeniden atma hakkı.',
    icon: '🎲',
    amount: '+1 Zar Yenileme',
  },
  {
    type: 'time',
    label: 'Ek Hamle Süresi',
    description: 'Zorlu pozisyonlarda derin hesaplama için +15 saniye ek süre.',
    icon: '⏳',
    amount: '+15 Saniye',
  },
];

export const SPONSORED_CREATIVES: AdMobCreative[] = [
  {
    id: 'ad_placeholder_1',
    sponsorName: 'Örnek Marka',
    headline: 'Ürün Reklamı Örneği',
    tagline: 'Bu bir yer tutucudur, gerçek marka içermiyor.',
    ctaText: 'Keşfet',
    icon: '☕',
    bannerImage: '/images/antique_kahvehane_nostalgia.jpg',
    rating: 4.9,
    badgeText: 'Örnek',
    category: 'Genel',
  },
  {
    id: 'ad_placeholder_2',
    sponsorName: 'Örnek Mağaza',
    headline: 'Mağaza Tanıtımı',
    tagline: 'Gerçek bir marka tanıtımı değildir.',
    ctaText: 'Gör',
    icon: '🪵',
    bannerImage: '/images/tavla_board.jpg',
    rating: 4.8,
    badgeText: 'Örnek',
    category: 'Genel',
  },
  {
    id: 'ad_placeholder_3',
    sponsorName: 'Örnek Turnuva',
    headline: 'Turnuva Tanıtımı',
    tagline: 'Sadece bir görsel simülasyondur.',
    ctaText: 'Katıl',
    icon: '🏆',
    bannerImage: '/images/kahvehane_ambient.jpg',
    rating: 5.0,
    badgeText: 'Örnek',
    category: 'Genel',
  },
  {
    id: 'ad_placeholder_4',
    sponsorName: 'Örnek Mekan',
    headline: 'Mekan Tanıtımı',
    tagline: 'Gerçek bir işletmeye ait değil.',
    ctaText: 'Ziyaret Et',
    icon: '🌊',
    bannerImage: '/images/antique_kahvehane_nostalgia.jpg',
    rating: 4.7,
    badgeText: 'Örnek',
    category: 'Genel',
  },
  {
    id: 'ad_placeholder_5',
    sponsorName: 'Örnek İçecek',
    headline: 'İçecek Reklamı',
    tagline: 'Yer tutucu içeriktir.',
    ctaText: 'Söyle',
    icon: '🫖',
    bannerImage: '/images/antique_kahvehane_nostalgia.jpg',
    rating: 4.9,
    badgeText: 'Örnek',
    category: 'Genel',
  },
  {
    id: 'ad_placeholder_6',
    sponsorName: 'Örnek Koleksiyon',
    headline: 'Koleksiyon Tanıtımı',
    tagline: 'Sadece simülasyon amaçlıdır.',
    ctaText: 'Gör',
    icon: '🏛️',
    bannerImage: '/images/tavla_board.jpg',
    rating: 4.8,
    badgeText: 'Örnek',
    category: 'Genel',
  },
  {
    id: 'ad_placeholder_7',
    sponsorName: 'Örnek Tatlı',
    headline: 'Tatlı Reklamı',
    tagline: 'Gerçek bir ürün değil.',
    ctaText: 'Sipariş Ver',
    icon: '🍬',
    bannerImage: '/images/kahvehane_ambient.jpg',
    rating: 5.0,
    badgeText: 'Örnek',
    category: 'Genel',
  },
];

// --- TEK KAYNAK: reklam kotaları ---
// Bu iki sabit tüm uygulamada (storage, modallar, lobi) ortak kullanılır.
// Günlük limit ve bekleme süresi değişecekse SADECE burası değişir.
export const AD_MAX_DAILY_REWARDS = 8;
export const AD_REWARDED_COOLDOWN_MS = 3 * 60 * 1000; // 3 dakika
// Native reklamda takılmaya karşı üst sınır (beyaz ekranda kilitlenmeyi önler)
export const AD_NATIVE_TIMEOUT_MS = 60 * 1000;
// Reklam yüklemesi için bekleme üst sınırı: hazır olmayan reklam ASLA açılmaz
export const AD_REWARD_LOAD_TIMEOUT_MS = 20 * 1000;

// Ödüllü video sonucu: boolean yerine sebepli nesne (UI doğru mesajı gösterir)
export type RewardedResultReason =
  | 'completed' // video sonuna kadar izlendi, ödül hak edildi
  | 'dismissed-early' // kullanıcı erken kapattı, ödül yok
  | 'load-failed' // reklam yüklenemedi (bağlantı/no-fill), hiçbir pencere açılmadı
  | 'show-failed' // yüklenen reklam açılamadı
  | 'timeout' // native yanıt vermedi
  | 'not-native'; // web: simülasyona düş
export interface RewardedResult {
  completed: boolean;
  reason: RewardedResultReason;
}

class AdmobService {
  // TEST MODU: true iken Google test reklam birimleri kullanılır (politika güvenli).
  // Test bitince .env.local'da NEXT_PUBLIC_ADMOB_TEST_MODE=false yap, gerçek ID'ler zaten dosyada.
  public readonly isTestMode: boolean =
    process.env.NEXT_PUBLIC_ADMOB_TEST_MODE === 'true' || !process.env.NEXT_PUBLIC_ADMOB_BANNER_ID;

  // AdMob IDs: test modunda Google test ID'leri, canlıda env'deki gerçek ID'ler
  public readonly AD_UNITS = this.isTestMode
    ? {
        BANNER: 'ca-app-pub-3940256099942544/6300978111',
        INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
        REWARDED: 'ca-app-pub-3940256099942544/5224354917',
        REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/5354046379',
      }
    : {
        BANNER:
          process.env.NEXT_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-3940256099942544/6300978111',
        INTERSTITIAL:
          process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/1033173712',
        REWARDED:
          process.env.NEXT_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-3940256099942544/5224354917',
        REWARDED_INTERSTITIAL:
          process.env.NEXT_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/5354046379',
      };

  private matchesPlayedCounter: number = 0;
  private readonly INTERSTITIAL_MATCH_INTERVAL: number = 4; // Every 4 finished matches (AdMob frequent-interstitial önlemi)

  // Cooldown between rewarded video ads: 3 minutes (180s)
  public readonly REWARDED_COOLDOWN_MS: number = AD_REWARDED_COOLDOWN_MS;
  public readonly DAILY_REWARD_CAP: number = AD_MAX_DAILY_REWARDS;

  // Gerçek native SDK var mı? (@capacitor-community/admob yüklüyse)
  public isNativeAdMobAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
    try {
      return !!w.Capacitor?.isNativePlatform?.();
    } catch {
      return false;
    }
  }

  public async initialize(): Promise<void> {
    if (!this.isNativeAdMobAvailable()) return;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      const testDevices = process.env.NEXT_PUBLIC_ADMOB_TEST_DEVICES
        ? process.env.NEXT_PUBLIC_ADMOB_TEST_DEVICES.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      await AdMob.initialize({
        initializeForTesting: this.isTestMode,
        testingDevices: testDevices,
        tagForUnderAgeOfConsent: false,
      });
    } catch (e) {
      console.debug('AdMob native init atlandı (web fallback aktif)', e);
    }
  }

  // Gerçek ödüllü video: native varsa native, yoksa not-native (UI simülasyona düşer)
  //
  // KANITLI NATIVE DAVRANIŞ (@capacitor-community/admob v8 Java kaynağı):
  // - prepare: yüklenince resolve, yüklenemezse reject (düzgün).
  // - show: SADECE ödül kazanılınca resolve eder; ödülsüz kapatmada söz
  //   ASLA çözülmez/reddedilmez (sonsuz asılı kalır!). Bu yüzden show'u tek
  //   başına await ETME — Dismissed/FailedToShow sinyalleriyle yarıştır.
  // - Hazır olmayan reklamı açma: önce prepare'in çözülmesini bekle
  //   (boş/beyaz reklam penceresi açılmaz).
  public async showRewardedNative(): Promise<RewardedResult> {
    if (!this.isNativeAdMobAvailable()) return { completed: false, reason: 'not-native' };
    const listeners: Array<{ remove: () => void }> = [];
    const adId = this.AD_UNITS.REWARDED;
    try {
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');
      let rewarded = false;
      let dismissedResolve: () => void = () => {};
      const dismissedSignal = new Promise<void>(res => {
        dismissedResolve = res;
      });
      // Listener'lar prepare/show'dan ÖNCE (yarış durumu düzeltmesi)
      listeners.push(
        ...(await Promise.all([
          AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
            rewarded = true;
          }),
          AdMob.addListener(RewardAdPluginEvents.Dismissed, () => dismissedResolve()),
          AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => dismissedResolve()),
        ]))
      );

      // 1) YÜKLE + BEKLE: reklam hazır değilse pencereyi hiç açma
      try {
        const loadTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('reward-load-timeout')), AD_REWARD_LOAD_TIMEOUT_MS)
        );
        await Promise.race([AdMob.prepareRewardVideoAd({ adId }), loadTimeout]);
      } catch (e) {
        console.debug('Rewarded yüklenemedi (pencere açılmadı)', e);
        return { completed: false, reason: 'load-failed' };
      }

      // 2) GÖSTER: show sözü ödülde döner; ödülsüz kapatmada native asılı
      // kalır → Dismissed sinyaliyle anında UI'a dön ("gitmiyor" hissi biter)
      const showOutcome = AdMob.showRewardVideoAd({ adId }).then(
        () => ({ settled: true as const, completed: true, rejected: false }),
        () => ({ settled: true as const, completed: false, rejected: true })
      );
      const dismissedOutcome = dismissedSignal.then(() => ({
        settled: true as const,
        completed: rewarded,
        rejected: false,
      }));
      const timeoutOutcome = new Promise<{ settled: boolean; completed: boolean; rejected: boolean }>(res =>
        setTimeout(() => res({ settled: false, completed: false, rejected: false }), AD_NATIVE_TIMEOUT_MS)
      );
      const outcome = await Promise.race([showOutcome, dismissedOutcome, timeoutOutcome]);
      if (outcome.completed || rewarded) return { completed: true, reason: 'completed' };
      if (!outcome.settled) return { completed: false, reason: 'timeout' };
      // show reddettiyse (hazır reklam yoktu) show-failed, kapatıldıysa dismissed
      if (outcome.rejected) return { completed: false, reason: 'show-failed' };
      return { completed: false, reason: 'dismissed-early' };
    } catch (e) {
      console.debug('Native rewarded başarısız', e);
      return { completed: false, reason: 'show-failed' };
    } finally {
      for (const l of listeners) {
        try {
          await l.remove();
        } catch {
          /* zaten temizlenmiş */
        }
      }
    }
  }

  // Gerçek geçiş reklamı (2 maçta bir, kapatılabilir — AdMob politikasına uygun)
  // (Interstitial show native'de açılışta çözülür, rewarded gibi asılı kalmaz.)
  public async showInterstitialNative(): Promise<boolean> {
    if (!this.isNativeAdMobAvailable()) return false;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      const adId = this.AD_UNITS.INTERSTITIAL;
      await AdMob.prepareInterstitial({ adId });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('interstitial-timeout')), AD_NATIVE_TIMEOUT_MS)
      );
      await Promise.race([AdMob.showInterstitial({ adId }), timeout]);
      return true;
    } catch (e) {
      console.debug('Native interstitial başarısız', e);
      return false;
    }
  }

  // --- Banner (alt kenar, uyarlanabilir) ---
  // Native banner webview'in ÜSTÜNDE bir overlay olduğu için yüksekliği
  // --admob-banner-h CSS değişkenine yazılır; layout boşluğu ona göre ayırır.
  // Tek örnek mantığı: aynı anda yalnızca bir banner yaşar.
  private bannerActive = false;
  private bannerHeight = 0;
  private bannerListeners: Array<{ remove: () => void }> = [];

  private setBannerReservedHeight(px: number): void {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(
      '--admob-banner-h',
      `${Math.max(0, Math.round(px))}px`
    );
  }

  private async detachBannerListeners(): Promise<void> {
    for (const l of this.bannerListeners) {
      try {
        await l.remove();
      } catch {
        /* zaten temizlenmiş */
      }
    }
    this.bannerListeners = [];
  }

  // Bannerı ekrana getir (ilk açılışta showBanner, sonraki dönüşlerde resumeBanner)
  public async showBannerNative(): Promise<boolean> {
    if (!this.isNativeAdMobAvailable()) return false;
    try {
      const { AdMob, BannerAdPluginEvents, BannerAdPosition, BannerAdSize } = await import(
        '@capacitor-community/admob'
      );

      if (!this.bannerActive) {
        await this.detachBannerListeners();
        this.bannerListeners = await Promise.all([
          AdMob.addListener(BannerAdPluginEvents.SizeChanged, size => {
            this.bannerHeight = size?.height ?? 0;
            this.setBannerReservedHeight(this.bannerHeight);
          }),
          AdMob.addListener(BannerAdPluginEvents.FailedToLoad, info => {
            console.debug('Banner yüklenemedi', info);
            this.bannerActive = false;
            this.bannerHeight = 0;
            this.setBannerReservedHeight(0);
          }),
        ]);

        await AdMob.showBanner({
          adId: this.AD_UNITS.BANNER,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: this.isTestMode,
        });
        this.bannerActive = true;
        return true;
      }

      // Zaten yüklü → sadece tekrar göster (boyut bilgisi elimizde)
      await AdMob.resumeBanner();
      this.setBannerReservedHeight(this.bannerHeight);
      return true;
    } catch (e) {
      console.debug('Banner gösterilemedi', e);
      this.bannerActive = false;
      this.setBannerReservedHeight(0);
      return false;
    }
  }

  // Bannerı gizle (modal oyun içi tam ekran modlarda) — reklam yok edilmez
  public async hideBannerNative(): Promise<void> {
    if (!this.isNativeAdMobAvailable() || !this.bannerActive) return;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.hideBanner();
    } catch (e) {
      console.debug('Banner gizlenemedi', e);
    }
    this.setBannerReservedHeight(0);
  }

  // Sayfa tamamen kapanınca yok et (uygulama kapanışında çağrılır)
  public async removeBannerNative(): Promise<void> {
    if (!this.isNativeAdMobAvailable() || !this.bannerActive) {
      this.setBannerReservedHeight(0);
      return;
    }
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.removeBanner();
    } catch {
      /* yoksay */
    }
    await this.detachBannerListeners();
    this.bannerActive = false;
    this.bannerHeight = 0;
    this.setBannerReservedHeight(0);
  }

  // Preload rewarded video ad (AdMob best practice)
  public async prepareRewardVideo(): Promise<boolean> {
    if (!this.isNativeAdMobAvailable()) return true;
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.prepareRewardVideoAd({ adId: this.AD_UNITS.REWARDED });
      return true;
    } catch {
      return false;
    }
  }

  public recordMatchFinished(): void {
    this.matchesPlayedCounter += 1;
  }

  public shouldShowInterstitial(): boolean {
    return this.matchesPlayedCounter >= this.INTERSTITIAL_MATCH_INTERVAL;
  }

  public resetInterstitialCounter(): void {
    this.matchesPlayedCounter = 0;
  }

  public getRandomCreative(): AdMobCreative {
    const idx = Math.floor(Math.random() * SPONSORED_CREATIVES.length);
    return SPONSORED_CREATIVES[idx];
  }

  // AI Studio / cihazda hata ayıklama: hangi birimler aktif? (ID'lerin tamamını
  // loglamaz — sadece test-gerçek ayrımı + son 4 hane. Sırrı konsola dökmez.)
  public describeActiveUnits(): { testMode: boolean; units: Record<string, string> } {
    const mask = (id: string) => (id.includes('3940256099942544') ? 'GOOGLE-TEST-ID' : `gerçek-id(…${id.slice(-4)})`);
    return {
      testMode: this.isTestMode,
      units: {
        BANNER: mask(this.AD_UNITS.BANNER),
        INTERSTITIAL: mask(this.AD_UNITS.INTERSTITIAL),
        REWARDED: mask(this.AD_UNITS.REWARDED),
      },
    };
  }
}

export const admobService = new AdmobService();
