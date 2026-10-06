import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get('tab') || 'all';

  let sorted = [...GLOBAL_PLAYERS];

  if (tab === 'blitz') {
    // Sort with Blitz ratings & fast play style
    sorted.sort((a, b) => b.wins * 2 + b.rating - (a.wins * 2 + a.rating));
  } else if (tab === 'mars') {
    // Sort by Mars count
    sorted.sort((a, b) => b.marsCount - a.marsCount);
  } else {
    // Standard Elo rating
    sorted.sort((a, b) => b.rating - a.rating);
  }

  // Update sequential ranks after sort
  const formatted = sorted.map((p, idx) => ({
    ...p,
    rank: idx + 1,
  }));

  return NextResponse.json(
    {
      success: true,
      provider: 'Local offline league (v1.0)',
      mode: 'offline',
      note: 'Gerçek çevrimiçi sunucu bağlanana kadar liste yereldir; küresel sıralama iddiası yoktur.',
      edgeLocation: 'Yerel Cihaz',
      cachedAt: new Date().toISOString(),
      activeTab: tab,
      players: formatted,
    },
    {
      headers: {
        'Server': 'Duses-Tavla-Local/1.0',
        'X-League-Mode': 'offline',
        'X-Edge-Region': 'on-device',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
