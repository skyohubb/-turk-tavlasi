export type PlayerColor = 'white' | 'black'; // white: Sedef (Player), black: Abanoz (Opponent/Bot)

export interface Point {
  pointIndex: number; // 0 to 23
  color: PlayerColor | null;
  count: number;
}

export interface Move {
  from: number | 'bar'; // 0..23 or 'bar'
  to: number | 'off';   // 0..23 or 'off'
  dieValue: number;
  isHit?: boolean;
}

export interface BoardState {
  points: Point[]; // 24 points: index 0 to 23
  bar: {
    white: number; // White checkers on bar
    black: number; // Black checkers on bar
  };
  borneOff: {
    white: number; // White checkers borne off (max 15)
    black: number; // Black checkers borne off (max 15)
  };
}

export interface TurnSnapshot {
  board: BoardState;
  remainingMoves: number[];
  executedMoves: Move[];
}

export interface GameStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  marsWins: number;
  marsLosses: number;
  totalCoins: number;
  level: number;
  xp: number;
  diceRollFrequencies: Record<string, number>;
  favoriteOpponent: string;
}

export interface Opponent {
  id: string;
  name: string;
  title: string;
  avatar: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'grandmaster';
  catchphrase: string;
  venue: string;
  rating: number;
}

export type GameMode = 'ai' | 'blitz' | 'local_2p' | 'online_match';

export type GamePhase = 
  | 'WAITING_ROLL' 
  | 'ROLLING' 
  | 'SELECTING_MOVE' 
  | 'AI_THINKING' 
  | 'TURN_FINISHED' 
  | 'GAME_OVER';

export interface DiceCallout {
  name: string;      // e.g. "Düşeş", "Penc-ü Se"
  rhyme?: string;    // e.g. "Severler güzeli penc-ü se"
  d1: number;
  d2: number;
}
