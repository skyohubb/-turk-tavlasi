'use client';

// Çevrimdışı Kahvehane Ligi verisi (v1.0).
// Eskiden /api/leaderboard route'unda yaşıyordu; native AAB (statik export)
// sunucu route'u barındıramadığı için buraya taşındı. Liste yereldir,
// küresel sıralama iddiası yoktur.

export interface LeaderboardPlayer {
  rank: number;
  id: string;
  name: string;
  title: string;
  avatar: string;
  flag: string;
  country: string;
  rating: number;
  wins: number;
  losses: number;
  marsCount: number;
  winRate: string;
  tier: string;
  tierId: 'grandmaster' | 'master' | 'diamond' | 'platinum' | 'gold';
  recentStreak: number;
}

export type LeaderboardTab = 'all' | 'blitz' | 'mars';

const GLOBAL_PLAYERS: LeaderboardPlayer[] = [
  {
    rank: 1,
    id: 'p_selim',
    name: 'Usta Selim',
    title: 'Kapalıçarşı Piri',
    avatar: '/images/avatar_haci_dayi.jpg',
    flag: '🇹🇷',
    country: 'İstanbul, Türkiye',
    rating: 2180,
    wins: 582,
    losses: 84,
    marsCount: 196,
    winRate: '87%',
    tier: 'Padişah (Grandmaster)',
    tierId: 'grandmaster',
    recentStreak: 11,
  },
  {
    rank: 2,
    id: 'p_haci',
    name: 'Hacı Dayı',
    title: 'Çınaraltı Efsanesi',
    avatar: '/images/avatar_haci_dayi.jpg',
    flag: '🇹🇷',
    country: 'Bursa, Türkiye',
    rating: 2040,
    wins: 494,
    losses: 98,
    marsCount: 154,
    winRate: '83%',
    tier: 'Usta Piri (Master)',
    tierId: 'master',
    recentStreak: 7,
  },
  {
    rank: 3,
    id: 'p_mahmut',
    name: 'Mahmut Emmi',
    title: 'Galata Tavla Reisi',
    avatar: '/images/avatar_genc_cirak.jpg',
    flag: '🇹🇷',
    country: 'İzmir, Türkiye',
    rating: 1910,
    wins: 412,
    losses: 116,
    marsCount: 122,
    winRate: '78%',
    tier: 'Galata Reisi (Diamond)',
    tierId: 'diamond',
    recentStreak: 5,
  },
  {
    rank: 4,
    id: 'p_elmir',
    name: 'Elmir Nardov',
    title: 'Bakü Şahı',
    avatar: '/images/avatar_genc_cirak.jpg',
    flag: '🇦🇿',
    country: 'Bakü, Azerbaycan',
    rating: 1840,
    wins: 368,
    losses: 104,
    marsCount: 105,
    winRate: '78%',
    tier: 'Galata Reisi (Diamond)',
    tierId: 'diamond',
    recentStreak: 4,
  },
  {
    rank: 5,
    id: 'p_dervis',
    name: 'Derviş Cemal',
    title: 'Moda Sahil Üstadı',
    avatar: '/images/avatar_genc_cirak.jpg',
    flag: '🇹🇷',
    country: 'Kadıköy, Türkiye',
    rating: 1765,
    wins: 320,
    losses: 112,
    marsCount: 88,
    winRate: '74%',
    tier: 'Kıdemli Kalfa (Platinum)',
    tierId: 'platinum',
    recentStreak: 3,
  },
  {
    rank: 6,
    id: 'p_hans',
    name: 'Hans Becker',
    title: 'Kreuzberg Tavla Dostu',
    avatar: '/images/avatar_genc_cirak.jpg',
    flag: '🇩🇪',
    country: 'Berlin, Almanya',
    rating: 1690,
    wins: 275,
    losses: 120,
    marsCount: 71,
    winRate: '69%',
    tier: 'Kıdemli Kalfa (Platinum)',
    tierId: 'platinum',
    recentStreak: 2,
  },
  {
    rank: 7,
    id: 'p_rustem',
    name: 'Çaycı Rüstem',
    title: 'Tavşan Kanı Ustası',
    avatar: '/images/avatar_genc_cirak.jpg',
    flag: '🇹🇷',
    country: 'Üsküdar, Türkiye',
    rating: 1610,
    wins: 242,
    losses: 135,
    marsCount: 58,
    winRate: '64%',
    tier: 'Mahalle Şampiyonu (Gold)',
    tierId: 'gold',
    recentStreak: 1,
  },
  {
    rank: 8,
    id: 'p_cengiz',
    name: 'Rıhtım Cengiz',
    title: 'Karaköy Kaplanı',
    avatar: '/images/avatar_genc_cirak.jpg',
    flag: '🇹🇷',
    country: 'Karaköy, Türkiye',
    rating: 1540,
    wins: 210,
    losses: 128,
    marsCount: 46,
    winRate: '62%',
    tier: 'Mahalle Şampiyonu (Gold)',
    tierId: 'gold',
    recentStreak: 3,
  },
  {
    rank: 9,
    id: 'p_arthur',
    name: 'Arthur Pendelton',
    title: 'Soho Backgammon Knight',
    avatar: '/images/avatar_genc_cirak.jpg',
    flag: '🇬🇧',
    country: 'Londra, İngiltere',
    rating: 1485,
    wins: 188,
    losses: 119,
    marsCount: 39,
    winRate: '61%',
    tier: 'Mahalle Şampiyonu (Gold)',
    tierId: 'gold',
    recentStreak: 2,
  },
  {
    rank: 10,
    id: 'p_kemal',
    name: 'Kemal Reis',
    title: 'Ege Fırtınası',
    avatar: '/images/avatar_genc_cirak.jpg',
    flag: '🇹🇷',
    country: 'Bodrum, Türkiye',
    rating: 1430,
    wins: 164,
    losses: 110,
    marsCount: 34,
    winRate: '59%',
    tier: 'Mahalle Şampiyonu (Gold)',
    tierId: 'gold',
    recentStreak: 1,
  },
];

export interface LeaderboardResult {
  players: LeaderboardPlayer[];
  edgeLocation: string;
  cachedAt: string;
  activeTab: LeaderboardTab;
}

// Deterministik mini-hash (sunucusuz sezon simülasyonu için)
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Yılın haftası (YYYYWW) — tablo her hafta tazelenir, ağ gerekmez
function seasonWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return now.getFullYear() * 100 + week;
}

// Yaşayan lig: bot ustalar her hafta maç yapmış gibi reyting/galibiyetleri
// hafifçe kıpırdar. Tamamen yereldir — sunucu ve kota tüketmez.
function applySeasonDrift(players: LeaderboardPlayer[]): LeaderboardPlayer[] {
  const week = seasonWeek();
  return players.map(p => {
    const h = hashStr(`${p.id}#${week}`);
    const ratingDelta = Math.round(Math.sin(week * 0.7 + (h % 628) / 100) * 18);
    const winsDelta = h % 4;
    const marsDelta = Math.floor(h / 7) % 2;
    const wins = p.wins + winsDelta;
    const losses = p.losses + (h % 3 === 0 ? 1 : 0);
    const total = Math.max(1, wins + losses);
    return {
      ...p,
      rating: p.rating + ratingDelta,
      wins,
      losses,
      marsCount: p.marsCount + marsDelta,
      winRate: `${Math.round((wins / total) * 100)}%`,
    };
  });
}

export function getLeaderboardPlayers(tab: LeaderboardTab = 'all'): LeaderboardResult {
  const drifted = applySeasonDrift(GLOBAL_PLAYERS);
  const sorted = [...drifted];

  if (tab === 'blitz') {
    sorted.sort((a, b) => b.wins * 2 + b.rating - (a.wins * 2 + a.rating));
  } else if (tab === 'mars') {
    sorted.sort((a, b) => b.marsCount - a.marsCount);
  } else {
    sorted.sort((a, b) => b.rating - a.rating);
  }

  return {
    players: sorted.map((p, idx) => ({ ...p, rank: idx + 1 })),
    edgeLocation: 'Yerel Cihaz',
    cachedAt: new Date().toISOString(),
    activeTab: tab,
  };
}
