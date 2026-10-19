export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type BoardThemeId = 'wood' | 'tournament' | 'slate' | 'ocean' | 'obsidian';
export type PieceThemeId = 'classic' | 'modern' | 'neo';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  lightSquare: string;
  darkSquare: string;
  selectedSquare: string;
  lastMoveSquare: string;
  borderClass: string;
}

export type TimeControlKey =
  | 'unlimited'
  | '1+0'
  | '2+1'
  | '3+0'
  | '3+2'
  | '5+0'
  | '5+3'
  | '10+0'
  | '10+5'
  | '15+10'
  | '30+0';

export interface TimeControlConfig {
  key: TimeControlKey;
  label: string;
  category: 'Bullet' | 'Blitz' | 'Rapid' | 'Classical' | 'Untimed';
  initialSeconds: number;
  incrementSeconds: number;
}

export type GameMode =
  | 'vs_computer'
  | 'pass_and_play'
  | 'analysis'
  | 'puzzles'
  | 'openings'
  | 'engine_demo'
  | 'pgn_replay';

export interface EngineLevel {
  level: number;
  name: string;
  elo: number;
  depth: number;
  description: string;
}

export interface UserSettings {
  boardTheme: BoardThemeId;
  pieceTheme: PieceThemeId;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  showCoordinates: boolean;
  showLegalMoves: boolean;
  showBestMoveArrow: boolean;
  autoQueenPromotion: boolean;
  engineLevel: number; // 1 to 8
  defaultTimeControl: TimeControlKey;
  playerSidePreference: 'w' | 'b' | 'random';
}

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  fenBefore: string;
  fenAfter: string;
  evalScore?: number; // centipawns or M#
  classification?: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
}

export interface SavedGame {
  id: string;
  date: string;
  mode: GameMode;
  white: string;
  black: string;
  result: string; // '1-0' | '0-1' | '1/2-1/2' | '*'
  moves: string[];
  pgn: string;
  timeControl: TimeControlKey;
}

export interface Puzzle {
  id: string;
  title: string;
  theme: 'mate1' | 'mate2' | 'fork' | 'pin' | 'skewer' | 'discovered' | 'defensive' | 'endgame';
  themeLabel: string;
  rating: number;
  fen: string;
  turn: PieceColor;
  solution: string[]; // SAN moves e.g. ['Qxf7#'] or ['Nf6+', 'Kh8', 'Nxd7']
  hint: string;
  explanation: string;
}

export interface OpeningVariation {
  id: string;
  name: string;
  eco: string;
  category: 'e4' | 'd4' | 'Flank';
  description: string;
  moves: string[]; // SAN array
  fen: string;
  keyIdeas: string[];
  evaluation: string;
}
