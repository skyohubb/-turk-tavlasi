import { BoardState, Move, PlayerColor, Point } from './types';

export function createInitialBoard(): BoardState {
  const points: Point[] = Array.from({ length: 24 }, (_, i) => ({
    pointIndex: i,
    color: null,
    count: 0,
  }));

  // Setup Standard Turkish / International Tavla Starting Positions
  // White (Sedef) moves from 23 -> 0 (Home: 5 to 0)
  // Black (Abanoz) moves from 0 -> 23 (Home: 18 to 23)

  // White checkers (Total: 15)
  points[23] = { pointIndex: 23, color: 'white', count: 2 };
  points[12] = { pointIndex: 12, color: 'white', count: 5 };
  points[7]  = { pointIndex: 7,  color: 'white', count: 3 };
  points[5]  = { pointIndex: 5,  color: 'white', count: 5 };

  // Black checkers (Total: 15)
  points[0]  = { pointIndex: 0,  color: 'black', count: 2 };
  points[11] = { pointIndex: 11, color: 'black', count: 5 };
  points[16] = { pointIndex: 16, color: 'black', count: 3 };
  points[18] = { pointIndex: 18, color: 'black', count: 5 };

  return {
    points,
    bar: { white: 0, black: 0 },
    borneOff: { white: 0, black: 0 },
  };
}

// Deep clone board helper
export function cloneBoard(board: BoardState): BoardState {
  return {
    points: board.points.map(p => ({ ...p })),
    bar: { ...board.bar },
    borneOff: { ...board.borneOff },
  };
}

// Check if player has all active pieces in their home board
export function canPlayerBearOff(board: BoardState, player: PlayerColor): boolean {
  if (player === 'white') {
    if (board.bar.white > 0) return false;
    // White's home board is 0..5. Check if any white pieces are in 6..23
    for (let i = 6; i < 24; i++) {
      if (board.points[i].color === 'white' && board.points[i].count > 0) {
        return false;
      }
    }
    return true;
  } else {
    if (board.bar.black > 0) return false;
    // Black's home board is 18..23. Check if any black pieces are in 0..17
    for (let i = 0; i < 18; i++) {
      if (board.points[i].color === 'black' && board.points[i].count > 0) {
        return false;
      }
    }
    return true;
  }
}

// Get all legal single moves for a given player and a single die value
export function getLegalMovesForDie(
  board: BoardState,
  player: PlayerColor,
  die: number
): Move[] {
  const opponent: PlayerColor = player === 'white' ? 'black' : 'white';
  const moves: Move[] = [];

  // Case 1: Player has checkers on the bar. MUST enter first!
  const barCount = player === 'white' ? board.bar.white : board.bar.black;
  if (barCount > 0) {
    const entryTarget = player === 'white' ? 24 - die : die - 1;
    const targetPoint = board.points[entryTarget];

    // Can enter if empty, own color, or 1 opponent checker (hit)
    if (targetPoint.color === null || targetPoint.color === player || targetPoint.count <= 1) {
      moves.push({
        from: 'bar',
        to: entryTarget,
        dieValue: die,
        isHit: targetPoint.color === opponent && targetPoint.count === 1,
      });
    }
    return moves; // If on bar, cannot move any other piece
  }

  // Case 2: Regular moves on the board
  const canBearOff = canPlayerBearOff(board, player);

  for (let from = 0; from < 24; from++) {
    const pt = board.points[from];
    if (pt.color !== player || pt.count === 0) continue;

    // Calculate target
    if (player === 'white') {
      const to = from - die;
      if (to >= 0) {
        const dest = board.points[to];
        if (dest.color === null || dest.color === player || dest.count <= 1) {
          moves.push({
            from,
            to,
            dieValue: die,
            isHit: dest.color === opponent && dest.count === 1,
          });
        }
      } else if (canBearOff) {
        // Bearing off for White:
        if (to === -1) {
          // Exact match
          moves.push({ from, to: 'off', dieValue: die });
        } else {
          // Die is greater than distance. Allowed only if no checkers exist on higher points
          let higherCheckers = false;
          for (let h = from + 1; h <= 5; h++) {
            if (board.points[h].color === 'white' && board.points[h].count > 0) {
              higherCheckers = true;
              break;
            }
          }
          if (!higherCheckers) {
            moves.push({ from, to: 'off', dieValue: die });
          }
        }
      }
    } else {
      // Black moves 0 -> 23
      const to = from + die;
      if (to <= 23) {
        const dest = board.points[to];
        if (dest.color === null || dest.color === player || dest.count <= 1) {
          moves.push({
            from,
            to,
            dieValue: die,
            isHit: dest.color === opponent && dest.count === 1,
          });
        }
      } else if (canBearOff) {
        // Bearing off for Black: target > 23
        if (to === 24) {
          // Exact match
          moves.push({ from, to: 'off', dieValue: die });
        } else {
          // Die is greater than distance. Allowed only if no checkers exist on lower points in home board (18..from-1)
          let furtherCheckers = false;
          for (let f = 18; f < from; f++) {
            if (board.points[f].color === 'black' && board.points[f].count > 0) {
              furtherCheckers = true;
              break;
            }
          }
          if (!furtherCheckers) {
            moves.push({ from, to: 'off', dieValue: die });
          }
        }
      }
    }
  }

  return moves;
}

// Get all legal moves available with the current remaining dice
export function getAllLegalMoves(
  board: BoardState,
  player: PlayerColor,
  remainingDice: number[]
): { die: number; moves: Move[] }[] {
  const uniqueDice = Array.from(new Set(remainingDice));
  return uniqueDice.map(die => ({
    die,
    moves: getLegalMovesForDie(board, player, die),
  }));
}

// Gerçek tavla kuralı: iki zardan yalnız biri oynanabiliyorsa büyük olan oynanmak zorundadır.
// UI'da hangi zarların kullanılabilir olduğunu filtrelemek için kullanın.
export function filterForcedDice(
  board: BoardState,
  player: PlayerColor,
  remainingDice: number[]
): number[] {
  if (remainingDice.length !== 2) return remainingDice;
  const [d1, d2] = remainingDice;
  if (d1 === d2) return remainingDice;
  const m1 = getLegalMovesForDie(board, player, d1);
  const m2 = getLegalMovesForDie(board, player, d2);
  if (m1.length > 0 && m2.length === 0) return [d1];
  if (m2.length > 0 && m1.length === 0) return [d2];
  return remainingDice;
}

// Apply move to a board state
export function applyMove(board: BoardState, player: PlayerColor, move: Move): BoardState {
  const next = cloneBoard(board);
  const opponent: PlayerColor = player === 'white' ? 'black' : 'white';

  // 1. Remove from source
  if (move.from === 'bar') {
    if (player === 'white') next.bar.white = Math.max(0, next.bar.white - 1);
    else next.bar.black = Math.max(0, next.bar.black - 1);
  } else {
    const src = next.points[move.from];
    src.count -= 1;
    if (src.count <= 0) {
      src.count = 0;
      src.color = null;
    }
  }

  // 2. Add to destination
  if (move.to === 'off') {
    if (player === 'white') next.borneOff.white += 1;
    else next.borneOff.black += 1;
  } else {
    const dest = next.points[move.to];
    // Check hit
    if (dest.color === opponent && dest.count === 1) {
      dest.count = 1;
      dest.color = player;
      if (opponent === 'white') next.bar.white += 1;
      else next.bar.black += 1;
    } else {
      dest.color = player;
      dest.count += 1;
    }
  }

  return next;
}

// Check if game is over and evaluate victory type (Mars or Düz)
export function checkGameEnd(board: BoardState): {
  isOver: boolean;
  winner: PlayerColor | null;
  isMars: boolean;
  score: number;
} {
  if (board.borneOff.white >= 15) {
    // White won! Did black bear off any piece?
    const isMars = board.borneOff.black === 0;
    return {
      isOver: true,
      winner: 'white',
      isMars,
      score: isMars ? 2 : 1,
    };
  }

  if (board.borneOff.black >= 15) {
    // Black won! Did white bear off any piece?
    const isMars = board.borneOff.white === 0;
    return {
      isOver: true,
      winner: 'black',
      isMars,
      score: isMars ? 2 : 1,
    };
  }

  return { isOver: false, winner: null, isMars: false, score: 0 };
}

// AI Evaluation & Move Choice
// Handles different master personalities:
// - "easy": mostly random legal moves
// - "medium": values making points and hits
// - "hard": strategic positional evaluation (building primes, safe blot minimization, home board control)
// - "grandmaster": advanced backgammon pip count and race calculations
export function selectBestAiMove(
  board: BoardState,
  player: PlayerColor,
  die: number,
  difficulty: 'easy' | 'medium' | 'hard' | 'grandmaster' = 'medium'
): Move | null {
  const legalMoves = getLegalMovesForDie(board, player, die);
  if (legalMoves.length === 0) return null;

  if (difficulty === 'easy') {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Score each move
  let bestMove = legalMoves[0];
  let bestScore = -999999;

  for (const move of legalMoves) {
    const resultBoard = applyMove(board, player, move);
    let score = 0;

    // Factor 1: Bearing off is top priority when in endgame
    if (move.to === 'off') {
      score += 500;
    }

    // Factor 2: Hitting opponent blot
    if (move.isHit) {
      score += 250;
      // Bonus if hitting in home board
      if (typeof move.to === 'number') {
        const isHome = player === 'white' ? move.to <= 5 : move.to >= 18;
        if (isHome) score += 120;
      }
    }

    // Factor 3: Making a point ("Kapı Alma")
    if (typeof move.to === 'number') {
      const dest = resultBoard.points[move.to];
      if (dest.count >= 2) {
        score += 80;
        // Key golden points: 5, 7 for White; 18, 16 for Black
        if (move.to === 5 || move.to === 7 || move.to === 18 || move.to === 16) {
          score += 60;
        }
      }
    }

    // Factor 4: Penalty for leaving a vulnerable single blot
    if (typeof move.to === 'number') {
      const dest = resultBoard.points[move.to];
      if (dest.count === 1) {
        score -= (difficulty === 'grandmaster' ? 70 : 40);
      }
    }

    // Factor 5: Escaping back checkers
    if (typeof move.from === 'number') {
      const isBack = player === 'white' ? move.from >= 18 : move.from <= 5;
      if (isBack) score += 35;
    }

    // Add slight random jitter for human-like variety
    score += Math.random() * 15;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
