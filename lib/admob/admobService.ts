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
    id: 'ad_kahve',
    sponsorName: 'Tarihi Kurukahveci Mehmet Efendi',
    headline: 'Tavlanın Yanına Közde Türk Kahvesi',
    tagline: '1871\'den beri geleneksel lezzet. İnce belli çay ve taze kahve keyfi.',
    ctaText: 'Keşfet',
    icon: '☕',
    bannerImage: '/images/antique_kahvehane_nostalgia.jpg',
    rating: 4.9,
    badgeText: 'Özel Sponsor',
    category: 'Gıda & İçecek',
  },
  {
    id: 'ad_woodcraft',
    sponsorName: 'Kapalıçarşı Sedef & Gül Ağacı Zanaat',
    headline: 'El İşçiliği Osmanlı Tavla Koleksiyonu',
    tagline: 'Ceviz oyma, fildişi ve sedef motifli efsanevi ahşap ustaları.',
    ctaText: 'Koleksiyonu Gör',
    icon: '🪵',
    bannerImage: '/images/tavla_board.jpg',
    rating: 4.8,
    badgeText: 'Zanaat',
    category: 'Ahşap & Dekorasyon',
  },
  {
    id: 'ad_tournament',
    sponsorName: 'Düşeş Şampiyonlar Ligi',
    headline: 'Haftalık 10.000 Akçelik Büyük Tavla Turnuvası',
    tagline: 'İstanbul, İzmir ve Bursa ustalarıyla online meydan okuma.',
    ctaText: 'Turnuvaya Katıl',
    icon: '🏆',
    bannerImage: '/images/kahvehane_ambient.jpg',
    rating: 5.0,
    badgeText: 'Resmi Turnuva',
    category: 'E-Spor & Oyun',
  },
  {
    id: 'ad_bosphorus',
    sponsorName: 'Boğaziçi Çınaraltı Çay Bahçesi',
    headline: 'Deniz Kokusunda Tavla Şakırtısı',
    tagline: 'Asırlık çınarların altında demli çay ve dost sohbeti.',
    ctaText: 'Ziyaret Et',
    icon: '🌊',
    bannerImage: '/images/antique_kahvehane_nostalgia.jpg',
    rating: 4.7,
    badgeText: 'Tarihi Mekan',
    category: 'Kültür & Seyahat',
  },
  {
    id: 'ad_tea',
    sponsorName: 'Rize Çayeli Demlik İkramı',
    headline: 'Tavşan Kanı Hakiki Karadeniz Çayı',
    tagline: 'Tavla keyfini ikiye katlayan taze hasat, ince belli bardakta köz lezzeti.',
    ctaText: 'Çay Söyle',
    icon: '🫖',
    bannerImage: '/images/antique_kahvehane_nostalgia.jpg',
    rating: 4.9,
    badgeText: 'Doğal Lezzet',
    category: 'Gıda & İçecek',
  },
  {
    id: 'ad_antika',
    sponsorName: 'Horhor Antikacılar Çarşısı',
    headline: 'Nadir Kemik Zar & Sedef Takımlar',
    tagline: 'Koleksiyonerlere özel asırlık pirinç kakmalı ve ceviz antika tavlalar.',
    ctaText: 'Mezatı Gör',
    icon: '🏛️',
    bannerImage: '/images/tavla_board.jpg',
    rating: 4.8,
    badgeText: 'Antika & Sanat',
    category: 'Koleksiyon',
  },
  {
    id: 'ad_lokum',
    sponsorName: 'Hafız Mustafa 1864',
    headline: 'Güllü & Fıstıklı Sultan Lokumları',
    tagline: 'Tavla zaferini tatlandıran geleneksel Osmanlı saray lezzeti.',
    ctaText: 'Sipariş Ver',
    icon: '🍬',
    bannerImage: '/images/kahvehane_ambient.jpg',
    rating: 5.0,
    badgeText: 'Saray Lezzeti',
    category: 'Tatlı & İkram',
  },
];

class AdmobService {
  // AdMob IDs: env'den gelir, yoksa Google test ID'leri (asla production sayılmaz)
  public readonly AD_UNITS = {
    BANNER:
      process.env.NEXT_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL:
      process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/1033173712',
    REWARDED:
      process.env.NEXT_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-3940256099942544/5224354917',
    // Yedek: ödüllü geçiş (örn. can bitince tam ekran ödüllü akışta kullanılır)
    REWARDED_INTERSTITIAL:
      process.env.NEXT_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/5354046379',
  };

  public readonly isTestMode: boolean = !process.env.NEXT_PUBLIC_ADMOB_BANNER_ID;

  private matchesPlayedCounter: number = 0;
  private readonly INTERSTITIAL_MATCH_INTERVAL: number = 2; // Every 2 finished matches

  // Cooldown between rewarded video ads: 3 minutes (180s)
  public readonly REWARDED_COOLDOWN_MS: number = 3 * 60 * 1000;
  public readonly DAILY_REWARD_CAP: number = 6;

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
      await AdMob.initialize();
    } catch (e) {
      console.debug('AdMob native init atlandı (web fallback aktif)', e);
    }
  }

  // Gerçek ödüllü video: native varsa native, yoksa false dön (UI simülasyona düşer)
  public async showRewardedNative(): Promise<boolean> {
    if (!this.isNativeAdMobAvailable()) return false;
    try {
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');
      await AdMob.prepareRewardVideoAd({ adId: this.AD_UNITS.REWARDED });
      let rewarded = false;
      const l1 = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true;
      });
      await AdMob.showRewardVideoAd();
      l1.remove();
      return rewarded;
    } catch (e) {
      console.debug('Native rewarded başarısız, simülasyona düşüldü', e);
      return false;
    }
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
}

export const admobService = new AdmobService();
