export interface AvatarStyle {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  description: string;
  personalityTrait: string;
  unlockedByDefault: boolean;
  requiredLevel: number;
  requiredCoins: number;
  category: 'personality' | 'legend';
}

export interface AvatarFrame {
  id: string;
  name: string;
  description: string;
  ringClass: string;
  borderClass: string;
  glowClass: string;
  badgeIcon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requiredWins: number;
  requiredMars: number;
  requiredCoins: number;
}

export const COFFEEHOUSE_AVATARS: AvatarStyle[] = [
  {
    id: 'tavla_cirak',
    name: 'Hevesli Çırak',
    title: 'Kahvehane Çırağı',
    avatarUrl: '/images/avatar_genc_cirak.jpg',
    description: 'Tavla tahtasını zevkle açan, ustaların eline su dökmeye talip neşeli ve hızlı Boğaziçi genci.',
    personalityTrait: 'Hızlı Zar & Sonsuz Şevk',
    unlockedByDefault: true,
    requiredLevel: 1,
    requiredCoins: 0,
    category: 'personality',
  },
  {
    id: 'cayci_rustem',
    name: 'Çaycı Rüstem',
    title: 'Tavşan Kanı Dem Ustası',
    avatarUrl: '/images/avatar_cayci_rustem.jpg',
    description: 'Çay kaşığı tıkırtısıyla tempoyu tutan, ince belli bardağı masadan eksik etmeyen kahvehanenin can damarı.',
    personalityTrait: 'Tavşan Kanı Çay & Kahve Ruhu',
    unlockedByDefault: true,
    requiredLevel: 1,
    requiredCoins: 0,
    category: 'personality',
  },
  {
    id: 'haci_dayi',
    name: 'Hacı Dayı',
    title: 'Çınaraltı Şampiyonu',
    avatarUrl: '/images/avatar_haci_dayi.jpg',
    description: 'Kasketi, kehribar tesbihi ve asırlık çınar altındaki engin sabrıyla zarları konuşturan bilge kurt.',
    personalityTrait: 'Ağırbaşlı Sabır & Kapı Sağlamlığı',
    unlockedByDefault: false,
    requiredLevel: 2,
    requiredCoins: 200,
    category: 'personality',
  },
  {
    id: 'genc_emre',
    name: 'Genç Emre',
    title: 'Hızlı Zar Ustası',
    avatarUrl: '/images/avatar_genc_emre.jpg',
    description: 'Hızlı hamleleri ve Boğaziçi enerjisiyle masayı alevlendiren karizmatik genç oyuncu.',
    personalityTrait: 'Boğaziçi Rüzgarı & Seri Zarlar',
    unlockedByDefault: false,
    requiredLevel: 2,
    requiredCoins: 250,
    category: 'personality',
  },
  {
    id: 'mahmut_emmi',
    name: 'Mahmut Emmi',
    title: 'Galata Tavla Reisi',
    avatarUrl: '/images/avatar_mahmut_emmi.jpg',
    description: 'Haliç rüzgarında kapı kapatmayı sanat haline getirmiş deniz kurdu tavlacı.',
    personalityTrait: 'Açık Kollama & Sert Kapılar',
    unlockedByDefault: false,
    requiredLevel: 4,
    requiredCoins: 500,
    category: 'personality',
  },
  {
    id: 'emekli_hoca',
    name: 'Muallim Hikmet Bey',
    title: 'Emekli Edebiyat Muallimi',
    avatarUrl: '/images/avatar_emekli_hoca.jpg',
    description: 'Gözlüklerinin ardından tahtayı süzen, her hamleyi vezir gibi hesaplayıp beyitlerle zar atan centilmen hoca.',
    personalityTrait: 'Matematiksel Hesap & Şiirsel Zarlar',
    unlockedByDefault: false,
    requiredLevel: 3,
    requiredCoins: 350,
    category: 'personality',
  },
  {
    id: 'usta_selim',
    name: 'Usta Selim',
    title: 'Kapalıçarşı Sedefkârı',
    avatarUrl: '/images/avatar_usta_selim.jpg',
    description: 'Sedef kakma antik tahtaların sırrına vakıf, cesur marsları ve kapı kapatma taktikleriyle çarşının piri.',
    personalityTrait: 'Mars Bahisleri & Sedefkâr Ustalığı',
    unlockedByDefault: false,
    requiredLevel: 5,
    requiredCoins: 650,
    category: 'legend',
  },
  {
    id: 'beyoglu_centilmeni',
    name: 'Beyoğlu Centilmeni',
    title: 'İstiklal Duayeni',
    avatarUrl: '/images/avatar_beyoglu_centilmeni.jpg',
    description: 'Fötr şapkası, kösteği ve zarif üslubuyla tavlayı bir zarafet ve beyefendilik düellosuna dönüştürür.',
    personalityTrait: 'Asalet & Kibar Hamleler',
    unlockedByDefault: false,
    requiredLevel: 7,
    requiredCoins: 1000,
    category: 'legend',
  },
];

export const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: 'frame_classic_wood',
    name: 'Masif Ceviz Çerçeve',
    description: 'Tavla tahtasının doğal ceviz ağacı dokusunu taşıyan geleneksel sade çerçeve.',
    ringClass: 'ring-2 ring-[#78350f]',
    borderClass: 'border-2 border-[#b45309]',
    glowClass: 'shadow-md',
    badgeIcon: '🪵',
    rarity: 'common',
    requiredWins: 0,
    requiredMars: 0,
    requiredCoins: 0,
  },
  {
    id: 'frame_bronze_kalfa',
    name: 'Antik Tunç Menteşe',
    description: 'Kıdemli tavla kalfalarına yaraşır antik dövme tunç ve pirinç çerçeve.',
    ringClass: 'ring-2 ring-[#d97706]/80',
    borderClass: 'border-2 border-[#f59e0b]',
    glowClass: 'shadow-[0_0_12px_rgba(217,119,6,0.45)]',
    badgeIcon: '🥉',
    rarity: 'common',
    requiredWins: 2,
    requiredMars: 0,
    requiredCoins: 150,
  },
  {
    id: 'frame_mother_of_pearl',
    name: 'Sedef Kakma & Fildişi',
    description: 'El işçiliği parlak sedef ve fildişi motiflerle süslü zarif saray çerçevesi.',
    ringClass: 'ring-3 ring-[#fef3c7]',
    borderClass: 'border-2 border-[#fbbf24]',
    glowClass: 'shadow-[0_0_16px_rgba(254,243,199,0.7)]',
    badgeIcon: '🐚',
    rarity: 'rare',
    requiredWins: 5,
    requiredMars: 1,
    requiredCoins: 350,
  },
  {
    id: 'frame_ruby_mars',
    name: 'Kızıl Yakut Mars Çerçevesi',
    description: 'Rakiplerine göz açtırmayan ve mars zaferleriyle nam salan fatihlere layık alev yakutu.',
    ringClass: 'ring-3 ring-[#ef4444] ring-offset-1 ring-offset-[#1a0e07]',
    borderClass: 'border-2 border-[#f87171]',
    glowClass: 'shadow-[0_0_18px_rgba(239,68,68,0.75)]',
    badgeIcon: '🔥',
    rarity: 'epic',
    requiredWins: 10,
    requiredMars: 3,
    requiredCoins: 600,
  },
  {
    id: 'frame_ottoman_gold',
    name: 'Osmanlı Altın Varak',
    description: 'Saray nakkaşlarının elinden çıkmış altın varaklı ve kehribar ışıltılı usta çerçevesi.',
    ringClass: 'ring-4 ring-[#fbbf24] ring-offset-2 ring-offset-[#1a0e07]',
    borderClass: 'border-2 border-[#f59e0b]',
    glowClass: 'shadow-[0_0_22px_rgba(251,191,36,0.85)]',
    badgeIcon: '👑',
    rarity: 'epic',
    requiredWins: 15,
    requiredMars: 5,
    requiredCoins: 900,
  },
  {
    id: 'frame_emerald_padisah',
    name: 'Zümrüt Padişah Tacı',
    description: 'Yalnızca büyük tavla üstatlarına layık yeşil zümrüt ve efsanevi zafer ışıltısı.',
    ringClass: 'ring-4 ring-[#10b981] ring-offset-2 ring-offset-[#120b07]',
    borderClass: 'border-2 border-[#34d399]',
    glowClass: 'shadow-[0_0_26px_rgba(16,185,129,0.9)]',
    badgeIcon: '💎',
    rarity: 'legendary',
    requiredWins: 25,
    requiredMars: 8,
    requiredCoins: 1600,
  },
];

export interface BoardSkin {
  id: string;
  name: string;
  woodType: string;
  description: string;
  previewImage: string;
  requiredCoins: number;
  unlockedByDefault: boolean;
  theme: {
    outerFrameGradient: string;
    outerBorderClass: string;
    feltBgClass: string;
    centerWatermark: string;
    watermarkColorClass: string;
    cornerColorClass: string;
    pointDarkColor: string;
    pointLightColor: string;
    accentBadge: string;
    tagText: string;
  };
}

export const BOARD_SKINS: BoardSkin[] = [
  {
    id: 'board_ceviz_klasik',
    name: 'Asırlık Ceviz & Sedef Kakma',
    woodType: 'Anadolu Dağ Cevizi',
    description: 'Tarihi kahvehanelerin simgesi; el işçiliği sedef noktalar, ceviz ağacı hareleri ve klasik pirinç köşebentler.',
    previewImage: '/images/tavla_board.jpg',
    requiredCoins: 0,
    unlockedByDefault: true,
    theme: {
      outerFrameGradient: 'from-[#3a2012] via-[#211209] to-[#180c05]',
      outerBorderClass: 'border-[#78350f]/60 shadow-[0_12px_45px_rgba(0,0,0,0.8)]',
      feltBgClass: 'bg-[#180e07]',
      centerWatermark: 'DÜŞEŞ · ASIRLIK CEVİZ',
      watermarkColorClass: 'text-[#fbbf24]/10',
      cornerColorClass: 'border-amber-500/60',
      pointDarkColor: '#854d0e',
      pointLightColor: '#fef3c7',
      accentBadge: '🏛️ Klasik Lonca',
      tagText: 'Geleneksel',
    },
  },
  {
    id: 'board_gul_agaci_lale',
    name: 'Gül Ağacı & Osmanlı Lale Tezyinatı',
    woodType: 'Kızıl Gül Ağacı (Rosewood)',
    description: 'Derin kızıl gül ağacı gövde üzerine altın yaldızlı Osmanlı rumi ve lale motifleri. Saray nakkaşlarının el işi zarafeti.',
    previewImage: '/images/board_gul_agaci.jpg',
    requiredCoins: 800,
    unlockedByDefault: false,
    theme: {
      outerFrameGradient: 'from-[#4a121a] via-[#2d0910] to-[#1c0408]',
      outerBorderClass: 'border-rose-700/60 shadow-[0_14px_50px_rgba(76,14,24,0.6)]',
      feltBgClass: 'bg-[#1f0a0e]',
      centerWatermark: 'DÜŞEŞ · LALE-İ OSMANİ',
      watermarkColorClass: 'text-rose-400/15',
      cornerColorClass: 'border-rose-400/80',
      pointDarkColor: '#991b1b',
      pointLightColor: '#fde68a',
      accentBadge: '🌷 Saray Tezyinatı',
      tagText: 'Osmanlı Gül Ağacı',
    },
  },
  {
    id: 'board_topkapi_turkuaz',
    name: 'Topkapı Sarayı Altın Varak & Turkuaz Çini',
    woodType: 'Altın Varaklı Meşe & İznik Çinisi',
    description: 'Topkapı Sarayı Revan Köşkü çinilerinin turkuaz ahengi, 24 ayar altın varak bordürler ve görkemli padişah tuğrası.',
    previewImage: '/images/board_topkapi_turkuaz.jpg',
    requiredCoins: 1500,
    unlockedByDefault: false,
    theme: {
      outerFrameGradient: 'from-[#0e3b43] via-[#082328] to-[#041316]',
      outerBorderClass: 'border-cyan-500/50 shadow-[0_14px_50px_rgba(6,78,59,0.5)]',
      feltBgClass: 'bg-[#081f24]',
      centerWatermark: 'DÜŞEŞ · TOPKAPI DERGAHI',
      watermarkColorClass: 'text-cyan-300/15',
      cornerColorClass: 'border-amber-300',
      pointDarkColor: '#0e7490',
      pointLightColor: '#fef08a',
      accentBadge: '👑 Padişah Murassa',
      tagText: 'İznik Turkuazı',
    },
  },
  {
    id: 'board_abanoz_selcuklu',
    name: 'Abanoz Ağacı & Fildişi Selçuklu Yıldızı',
    woodType: 'Kara Abanoz & Hakiki Fildişi Kakma',
    description: 'Gece kadar siyah abanoz ağacı üzerine kakılmış 8 köşeli Selçuklu geometrik kündekâri yıldızları. Asil ve keskin kontrast.',
    previewImage: '/images/board_abanoz_selcuklu.jpg',
    requiredCoins: 2000,
    unlockedByDefault: false,
    theme: {
      outerFrameGradient: 'from-[#27272a] via-[#18181b] to-[#09090b]',
      outerBorderClass: 'border-zinc-500/50 shadow-[0_14px_50px_rgba(0,0,0,0.9)]',
      feltBgClass: 'bg-[#121214]',
      centerWatermark: 'DÜŞEŞ · SELÇUKLU KÜNDEKÂRİ',
      watermarkColorClass: 'text-zinc-400/15',
      cornerColorClass: 'border-zinc-300',
      pointDarkColor: '#3f3f46',
      pointLightColor: '#f5f5f4',
      accentBadge: '⭐ Selçuklu Sanatı',
      tagText: 'Kara Abanoz',
    },
  },
  {
    id: 'board_zeytin_kehribar',
    name: 'Ege Zeytin Ağacı & Hakiki Kehribar',
    woodType: 'Asırlık Ege Zeytin Kütüğü & Kehribar',
    description: 'Dalgalı ve hareli zeytin damarları, güneşte parıldayan bal sarısı kehribar kakmalar ve Akdeniz sıcaklığı.',
    previewImage: '/images/tavla_crest.jpg',
    requiredCoins: 2500,
    unlockedByDefault: false,
    theme: {
      outerFrameGradient: 'from-[#45320e] via-[#291e07] to-[#171003]',
      outerBorderClass: 'border-amber-600/60 shadow-[0_14px_50px_rgba(180,83,9,0.4)]',
      feltBgClass: 'bg-[#1c1507]',
      centerWatermark: 'DÜŞEŞ · EGE ZEYTİNİ',
      watermarkColorClass: 'text-amber-400/15',
      cornerColorClass: 'border-amber-400',
      pointDarkColor: '#b45309',
      pointLightColor: '#fef3c7',
      accentBadge: '🌿 Asırlık Zeytin',
      tagText: 'Kehribar Kakma',
    },
  },
];

// Reklamlı indirim: normal fiyat tuzlu, video izleyene %50 indirim (min 150 akçe).
export const BOARD_AD_DISCOUNT_RATE = 0.5;
export const BOARD_DISCOUNT_MIN_PRICE = 150;
export const BOARD_DISCOUNT_TTL_MS = 10 * 60 * 1000; // 10 dakika geçerli

export function boardDiscountPrice(requiredCoins: number): number {
  return Math.max(
    BOARD_DISCOUNT_MIN_PRICE,
    Math.round(requiredCoins * (1 - BOARD_AD_DISCOUNT_RATE))
  );
}

