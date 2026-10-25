'use client';

// Düşeş Şampiyonlar Turnuvası (çevrimdışı, 3 tur):
// Çeyrek → Yarı → Büyük Final. Her tur farklı usta, ödül büyür.
// Sunucu yok — fikstür ve ödüller cihazda sabittir.

export interface TournamentRound {
  index: number; // 0..2
  label: string;
  opponentId: string;
  prize: number; // galibiyet akçesi
  marsPrize: number;
}

export const TOURNAMENT_ROUNDS: TournamentRound[] = [
  { index: 0, label: 'Çeyrek Final', opponentId: 'mahmut_emmi', prize: 400, marsPrize: 800 },
  { index: 1, label: 'Yarı Final', opponentId: 'haci_dayi', prize: 800, marsPrize: 1500 },
  { index: 2, label: 'Büyük Final', opponentId: 'usta_selim', prize: 2000, marsPrize: 3500 },
];

export const TOURNAMENT_TOTAL_ROUNDS = TOURNAMENT_ROUNDS.length;

export function getTournamentRound(index: number): TournamentRound {
  return TOURNAMENT_ROUNDS[Math.min(Math.max(index, 0), TOURNAMENT_ROUNDS.length - 1)];
}
