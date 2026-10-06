'use client';

import { BoardState, Move, PlayerColor } from './types';
import { getLegalMovesForDie, applyMove } from './engine';

export interface MoveAdvice {
  move: Move;
  title: string;
  reason: string;
  category: 'kapi_alma' | 'kirma' | 'toplama' | 'kacis' | 'emniyet';
  score: number;
  riskPercent: number; // 0..100%
  timeBonusSeconds: number; // e.g. +3s
  masterStreakGain: number; // e.g. +1
  rewardSummary: string; // e.g. "+3s Blitz Süresi & Kapı Güvenliği"
}

export interface AdvisorResult {
  hasMove: boolean;
  bestAdvice: MoveAdvice | null;
  alternativeAdvices: MoveAdvice[];
  totalPossibleMoves: number;
  highlightPoints: {
    from: number | 'bar';
    to: number | 'off';
    dieValue: number;
  } | null;
}

export function evaluateMoveAdvice(
  board: BoardState,
  player: PlayerColor,
  remainingDice: number[],
  isBlitz: boolean = false
): AdvisorResult {
  if (remainingDice.length === 0) {
    return {
      hasMove: false,
      bestAdvice: null,
      alternativeAdvices: [],
      totalPossibleMoves: 0,
      highlightPoints: null,
    };
  }

  // Find unique dice available
  const uniqueDice = Array.from(new Set(remainingDice));
  const candidateAdvices: MoveAdvice[] = [];
  const seenMoveKeys = new Set<string>();

  for (const die of uniqueDice) {
    const legalMoves = getLegalMovesForDie(board, player, die);

    for (const move of legalMoves) {
      const key = `${move.from}->${move.to}:${move.dieValue}`;
      if (seenMoveKeys.has(key)) continue;
      seenMoveKeys.add(key);

      const nextBoard = applyMove(board, player, move);
      let score = 0;
      let title = 'Usta Hamlesi';
      let reason = 'Tahtada dengeli ilerleme sağlar.';
      let category: MoveAdvice['category'] = 'emniyet';
      let riskPercent = 0;

      // 1. Bearing off
      if (move.to === 'off') {
        score += 600;
        title = 'Pul Toplama (Ev Safhası)';
        reason = 'Pulu tahtadan toplayarak zafere bir adım daha yaklaş!';
        category = 'toplama';
        riskPercent = 0;
      }
      // 2. Hitting opponent
      else if (move.isHit) {
        score += 350;
        title = 'Açık Kırma (Kritik Vuruş)';
        reason = 'Rakibin açıkta kalan pulunu kırıp bara yollayarak oyun temposunu eline al!';
        category = 'kirma';
        // Risk depending on how exposed our checker is
        riskPercent = move.to > 18 ? 10 : 25;
      }
      // 3. Making a key point
      else if (typeof move.to === 'number') {
        const dest = nextBoard.points[move.to];
        if (dest.count >= 2) {
          score += 180;
          category = 'kapi_alma';

          // Golden points for White (5, 7) or general home points
          if (move.to === 5 || move.to === 7) {
            score += 120;
            title = 'Altın Kapı Kurma (5/7)';
            reason = 'Tavlanın en kıymetli altın kapısını alarak rakibin önünü kesiyorsun!';
          } else if (move.to <= 5) {
            score += 80;
            title = 'Ev Sahasında Kapı';
            reason = 'İç sahada kapı yaparak rakibin barda kalma riskini katla!';
          } else {
            title = 'Stratejik Kapı Alma';
            reason = 'İki pulunu birleştirerek geçit vermez bir kale oluştur.';
          }
          riskPercent = 0;
        } else {
          // Leaving a single blot: calculate vulnerability
          riskPercent = 35;
          score -= 40;
          title = 'Taktik İlerleme';
          reason = 'Pulunu ileri taşıyarak pozisyonunu geliştir.';
        }
      }

      // 4. Escaping back checkers
      if (typeof move.from === 'number' && move.from >= 18 && player === 'white') {
        score += 70;
        if (category === 'emniyet') {
          title = 'Arka Pul Kaçışı';
          reason = 'Rakibin sahasında sıkışmış pulunu güvenli alana çıkar.';
          category = 'kacis';
        }
      }

      // Blitz bonus rewards
      const timeBonusSeconds = isBlitz ? 3 : 0;
      const masterStreakGain = 1;
      const rewardSummary = isBlitz
        ? `+${timeBonusSeconds}s Blitz Süresi & Usta Serisi +1`
        : 'Usta Hamle Serisi +1 & Prestij';

      candidateAdvices.push({
        move,
        title,
        reason,
        category,
        score,
        riskPercent,
        timeBonusSeconds,
        masterStreakGain,
        rewardSummary,
      });
    }
  }

  if (candidateAdvices.length === 0) {
    return {
      hasMove: false,
      bestAdvice: null,
      alternativeAdvices: [],
      totalPossibleMoves: 0,
      highlightPoints: null,
    };
  }

  // Sort candidate advices by score descending
  candidateAdvices.sort((a, b) => b.score - a.score);

  const bestAdvice = candidateAdvices[0];
  const alternativeAdvices = candidateAdvices.slice(1, 4);

  return {
    hasMove: true,
    bestAdvice,
    alternativeAdvices,
    totalPossibleMoves: candidateAdvices.length,
    highlightPoints: {
      from: bestAdvice.move.from,
      to: bestAdvice.move.to,
      dieValue: bestAdvice.move.dieValue,
    },
  };
}
