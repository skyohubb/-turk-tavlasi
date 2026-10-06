'use client';

import { GameStats } from '../tavla/types';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  avatarId?: string;
  frameId?: string;
  boardSkinId?: string;
  unlockedAvatars?: string[];
  unlockedFrames?: string[];
  unlockedBoardSkins?: string[];
  boardDiscounts?: Record<string, number>; // skinId -> indirim bitiş zamanı (ms)
  rating: number;
  coins: number;
  energy: number;
  maxEnergy: number;
  reRollCredits: number;
  extraTimeCredits: number;
  stats: GameStats;
  lastAdWatchedTimestamp: number;
  matchCountSinceLastAd: number;
  lastEnergyRegenTimestamp?: number;
  dailyAdsWatchedCount?: number;
  lastAdDate?: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  id: 'tavla_user_master_1',
  name: 'Tavla Çırağı',
  title: 'Hevesli Çırak',
  avatar: '/images/avatar_genc_cirak.jpg',
  avatarId: 'tavla_cirak',
  frameId: 'frame_classic_wood',
  boardSkinId: 'board_ceviz_klasik',
  unlockedAvatars: ['tavla_cirak', 'cayci_rustem'],
  unlockedFrames: ['frame_classic_wood'],
  unlockedBoardSkins: ['board_ceviz_klasik'],
  rating: 1200,
  coins: 500,
  energy: 5,
  maxEnergy: 5,
  reRollCredits: 1,
  extraTimeCredits: 2,
  stats: {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    marsWins: 0,
    marsLosses: 0,
    totalCoins: 500,
    level: 1,
    xp: 0,
    diceRollFrequencies: {},
    favoriteOpponent: 'Mahmut Emmi',
  },
  lastAdWatchedTimestamp: 0,
  matchCountSinceLastAd: 0,
};

// ASCII anahtar (bazı WebView'lerde Türkçe karakterli anahtarlar sorun çıkarır).
// Eski 'duşeş...' anahtarındaki kayıt otomatik taşınır.
const STORAGE_KEY = 'duses_tavla_profile_v1';
const STORAGE_KEY_LEGACY = 'duşeş_tavla_profile_v1';
const STORAGE_KEY_BACKUP = 'duses_tavla_profile_v1_backup';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache for leaderboard

function readSlot(key: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.stats) return null;
    return { ...DEFAULT_PROFILE, ...parsed } as UserProfile;
  } catch {
    return null;
  }
}

export class CloudflareStorage {
  private profile: UserProfile | null = null;
  private pendingSync: boolean = false;
  private leaderboardCache: { data: unknown; timestamp: number } | null = null;

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getSnapshot(): UserProfile {
    return this.getProfile();
  }

  public getServerSnapshot(): UserProfile {
    return DEFAULT_PROFILE;
  }

  public getProfile(): UserProfile {
    if (this.profile) return this.profile;

    if (typeof window !== 'undefined') {
      // 1) ana kasa → 2) yedek kasa → 3) eski anahtar (taşı) → 4) varsayılan
      const primary = readSlot(STORAGE_KEY);
      if (primary) {
        this.profile = primary;
        if (this.checkEnergyRegen(primary)) this.saveProfile(primary);
        return this.profile;
      }
      const backup = readSlot(STORAGE_KEY_BACKUP);
      if (backup) {
        this.profile = backup;
        // Yedekten döndük: ana kasayı hemen onar
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
        } catch {
          // sessiz geç
        }
        if (this.checkEnergyRegen(backup)) this.saveProfile(backup);
        return this.profile;
      }
      const legacy = readSlot(STORAGE_KEY_LEGACY);
      if (legacy) {
        this.profile = legacy;
        this.saveProfile(legacy); // ASCII anahtara + yedeğe taşı
        try {
          localStorage.removeItem(STORAGE_KEY_LEGACY);
        } catch {
          // sessiz geç
        }
        return this.profile;
      }
    }

    // Hiçbir kasada veri yok: varsayılanla başla ama YEDEĞİ EZME
    // (yazma başarısız olursa diye saveProfile yedeği korur).
    this.profile = { ...DEFAULT_PROFILE };
    this.saveProfile(this.profile);
    return this.profile;
  }

  private checkEnergyRegen(profile: UserProfile): boolean {
    if (profile.energy < profile.maxEnergy) {
      const now = Date.now();
      const lastRegen = profile.lastEnergyRegenTimestamp || now;
      const TEN_MINUTES_MS = 10 * 60 * 1000;
      const diff = now - lastRegen;
      if (diff >= TEN_MINUTES_MS) {
        const gained = Math.floor(diff / TEN_MINUTES_MS);
        profile.energy = Math.min(profile.maxEnergy, profile.energy + gained);
        profile.lastEnergyRegenTimestamp = now - (diff % TEN_MINUTES_MS);
        return true;
      }
    }
    return false;
  }

  public saveProfile(profile: UserProfile): void {
    this.profile = profile;
    if (typeof window !== 'undefined') {
      try {
        const serialized = JSON.stringify(profile);
        // Önce yedeği güncelle, sonra anayı yaz. Yazma yarıda kesilirse
        // bir önceki sağlam kopya her zaman durur — veri kaybı olmaz.
        try {
          localStorage.setItem(STORAGE_KEY_BACKUP, serialized);
        } catch {
          // kota doluysa yedek atlanır, ana yazma yine denenir
        }
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (e) {
        console.warn('LocalStorage write error', e);
      }
    }
    this.notify();
    // Queue optimized background sync
    this.triggerOptimizedSync();
  }

  public recordMatchResult(
    won: boolean,
    isMars: boolean,
    opponentName: string,
    coinsEarned: number,
    rolls: string[]
  ): UserProfile {
    const p = this.getProfile();
    const stats = p.stats;

    stats.matchesPlayed += 1;
    if (won) {
      stats.wins += 1;
      if (isMars) stats.marsWins += 1;
      p.rating += isMars ? 32 : 20;
    } else {
      stats.losses += 1;
      if (isMars) stats.marsLosses += 1;
      p.rating = Math.max(800, p.rating - (isMars ? 24 : 15));
    }

    p.coins += coinsEarned;
    stats.totalCoins = p.coins;

    // XP & Level calculations
    const xpGain = won ? (isMars ? 150 : 100) : 35;
    stats.xp += xpGain;
    stats.level = Math.floor(stats.xp / 300) + 1;

    // Update title based on level
    if (stats.level >= 10) p.title = 'Büyük Tavla Üstadı';
    else if (stats.level >= 6) p.title = 'Kahvehane Ustası';
    else if (stats.level >= 3) p.title = 'Kıdemli Kalfa';
    else p.title = 'Hevesli Çırak';

    // Record dice frequencies
    rolls.forEach(key => {
      stats.diceRollFrequencies[key] = (stats.diceRollFrequencies[key] || 0) + 1;
    });

    stats.favoriteOpponent = opponentName;
    p.matchCountSinceLastAd += 1;

    this.saveProfile(p);
    return p;
  }

  public consumeEnergy(amount: number = 1): boolean {
    const p = this.getProfile();
    this.checkEnergyRegen(p);
    if (p.energy < amount) return false;
    p.energy -= amount;
    p.lastEnergyRegenTimestamp = Date.now();
    this.saveProfile(p);
    return true;
  }

  // Energy & AdMob cooldown tracking (3 minutes or 1 match, or immediately if energy is 0)
  public canWatchRewardedAd(): { eligible: boolean; remainingSeconds: number; reason: string; dailyRemaining: number } {
    const p = this.getProfile();
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const dailyWatched = p.lastAdDate === today ? (p.dailyAdsWatchedCount || 0) : 0;
    const MAX_DAILY = 8;
    const dailyRemaining = Math.max(0, MAX_DAILY - dailyWatched);

    if (dailyRemaining <= 0) {
      return {
        eligible: false,
        remainingSeconds: 0,
        reason: 'Bugünkü ikram limitine ulaşıldı (Yarın yenilenir)',
        dailyRemaining: 0,
      };
    }

    // If user is completely out of energy, allow instant watch to restore energy!
    if (p.energy <= 0) {
      return { eligible: true, remainingSeconds: 0, reason: 'Can bitti! Taze çay ikramı hazır!', dailyRemaining };
    }

    const COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes cooldown
    const elapsed = now - p.lastAdWatchedTimestamp;

    if (p.lastAdWatchedTimestamp === 0 || elapsed >= COOLDOWN_MS) {
      return { eligible: true, remainingSeconds: 0, reason: 'İkram vakti hazır!', dailyRemaining };
    }

    if (p.matchCountSinceLastAd >= 1) {
      return { eligible: true, remainingSeconds: 0, reason: 'Maç tamamlandı, ikram hazır!', dailyRemaining };
    }

    const remaining = Math.max(0, Math.ceil((COOLDOWN_MS - elapsed) / 1000));
    return {
      eligible: false,
      remainingSeconds: remaining,
      reason: `${remaining} saniye sonra yeni ikram`,
      dailyRemaining,
    };
  }

  public claimAdReward(rewardType: 'coins' | 'reroll' | 'time' | 'energy'): UserProfile {
    const p = this.getProfile();
    const today = new Date().toISOString().split('T')[0];
    if (p.lastAdDate !== today) {
      p.lastAdDate = today;
      p.dailyAdsWatchedCount = 1;
    } else {
      p.dailyAdsWatchedCount = (p.dailyAdsWatchedCount || 0) + 1;
    }

    p.lastAdWatchedTimestamp = Date.now();
    p.matchCountSinceLastAd = 0;

    switch (rewardType) {
      case 'coins':
        p.coins += 500;
        p.stats.totalCoins = p.coins;
        break;
      case 'reroll':
        p.reRollCredits = Math.min(5, p.reRollCredits + 1);
        break;
      case 'time':
        p.extraTimeCredits = Math.min(8, p.extraTimeCredits + 2);
        break;
      case 'energy':
        p.energy = p.maxEnergy;
        break;
    }

    this.saveProfile(p);
    return p;
  }

  // Reklam izlendi damgası: sayaç/sayaç kotalarını ilerletir, ÖDÜL VERMEZ.
  // (Mağaza indirimi gibi ödülsüz video akışlarında global 3dk/günlük kotayı delmemek için.)
  public stampAdWatched(): UserProfile {
    const p = this.getProfile();
    const today = new Date().toISOString().split('T')[0];
    if (p.lastAdDate !== today) {
      p.lastAdDate = today;
      p.dailyAdsWatchedCount = 1;
    } else {
      p.dailyAdsWatchedCount = (p.dailyAdsWatchedCount || 0) + 1;
    }
    p.lastAdWatchedTimestamp = Date.now();
    p.matchCountSinceLastAd = 0;
    this.saveProfile(p);
    return p;
  }

  // Tahta indirim çeki: video karşılığı X dakika geçerli indirimli fiyat hakkı.
  public grantBoardDiscount(skinId: string, ttlMs: number): UserProfile {
    const p = this.getProfile();
    p.boardDiscounts = { ...(p.boardDiscounts || {}), [skinId]: Date.now() + ttlMs };
    this.saveProfile(p);
    return p;
  }

  public hasBoardDiscount(skinId: string): boolean {
    const p = this.getProfile();
    const until = p.boardDiscounts?.[skinId] || 0;
    // Saf okuma: render sırasında yan etki YOK (önceki sürüm burada kayıt
    // yazıp gereksiz yeniden çizim tetikliyordu). Süresi dolmuş anahtarlar
    // bir sonraki grant çağrısında temizlenir.
    return until > Date.now();
  }

  // Usta hamlesi bonusu: galibiyet/mağlubiyet sayacını bozmadan sadece akçe + XP verir.
  public addBonusCoins(amount: number, xp: number = 15): UserProfile {
    const p = this.getProfile();
    p.coins += amount;
    p.stats.totalCoins = p.coins;
    p.stats.xp += xp;
    p.stats.level = Math.floor(p.stats.xp / 300) + 1;
    this.saveProfile(p);
    return p;
  }

  // KVKK/GDPR + Play Data Safety: tüm yerel veriyi sil ve varsayılana dön.
  public resetProfile(): UserProfile {
    const fresh: UserProfile = {
      ...DEFAULT_PROFILE,
      id: `tavla_user_${Math.random().toString(36).slice(2, 8)}`,
      stats: { ...DEFAULT_PROFILE.stats, diceRollFrequencies: {} },
    };
    this.leaderboardCache = null;
    this.saveProfile(fresh);
    return fresh;
  }

  // Cloudflare Free Tier request throttler
  private triggerOptimizedSync() {
    if (this.pendingSync) return;
    this.pendingSync = true;

    // Debounce to batch multiple quick actions into 1 single fetch
    setTimeout(async () => {
      this.pendingSync = false;
      try {
        if (!this.profile) return;
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.profile.id,
            name: this.profile.name,
            rating: this.profile.rating,
            stats: this.profile.stats,
            coins: this.profile.coins,
          }),
        });
      } catch (err) {
        // Silently keep local state without breaking gameplay
        console.debug('Cloudflare sync edge status: local fallback active', err);
      }
    }, 1500);
  }

  public async fetchLeaderboard(): Promise<Array<{ rank: number; name: string; title: string; rating: number; wins: number; mars: number }>> {
    type Row = { rank: number; name: string; title: string; rating: number; wins: number; mars: number };
    const fallback: Row[] = [
      { rank: 1, name: 'Usta Selim', title: 'Kapalıçarşı Piri', rating: 1850, wins: 412, mars: 138 },
      { rank: 2, name: 'Hacı Dayı', title: 'Çınaraltı Şampiyonu', rating: 1720, wins: 345, mars: 98 },
      { rank: 3, name: 'Mahmut Emmi', title: 'Galata Tavla Reisi', rating: 1640, wins: 289, mars: 82 },
      { rank: 4, name: 'Derviş Cemal', title: 'Kadıköy Üstadı', rating: 1510, wins: 195, mars: 45 },
      { rank: 5, name: this.getProfile().name, title: this.getProfile().title, rating: this.getProfile().rating, wins: this.getProfile().stats.wins, mars: this.getProfile().stats.marsWins },
    ];

    // Check in-memory cache to save edge calls
    if (this.leaderboardCache && Date.now() - this.leaderboardCache.timestamp < CACHE_TTL_MS) {
      return this.leaderboardCache.data as Row[];
    }

    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        // API sarmalayıcı obje döner {players: [...]} — diziyi çıkar, bozuksa yedeğe düş
        const rows: Row[] = Array.isArray(data) ? data : data?.players;
        if (Array.isArray(rows) && rows.length > 0) {
          this.leaderboardCache = { data: rows, timestamp: Date.now() };
          return rows;
        }
      }
    } catch {
      // Fallback local simulated leaderboard
    }

    return fallback;
  }
}

export const cloudflareStorage = new CloudflareStorage();
