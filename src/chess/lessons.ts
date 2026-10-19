export interface ChessLesson {
  id: string;
  category: 'rules' | 'tactics' | 'openings' | 'notation' | 'endgames';
  categoryLabel: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  content: string[];
  keyTakeaway: string;
  fen?: string;
}

export const CHESS_LESSONS: ChessLesson[] = [
  // 1. Rules
  {
    id: 'lesson-castling-en-passant',
    category: 'rules',
    categoryLabel: 'Chess Rules',
    title: 'Castling and En Passant Invariants',
    subtitle: 'Master the two special movement rules that distinguish master chess from amateur play.',
    durationMinutes: 5,
    fen: 'r3k2r/8/8/8/3Pp3/8/8/R3K2R b KQkq d3 0 1',
    content: [
      'Castling is the only move in chess where two pieces move simultaneously: the King moves two squares toward the Rook, and that Rook hops directly over the King.',
      'Invariants: Castling is illegal if the King or the involved Rook has moved, if the King is currently in check, or if any square the King passes through is attacked by an enemy piece.',
      'En Passant: When a pawn advances two squares past an adjacent enemy pawn, that enemy pawn may capture it diagonally "in passing" as if it had only moved one square.',
      'Critical Timing: En passant must be executed immediately on the very next half-move; otherwise, the right is permanently lost for that pawn.',
    ],
    keyTakeaway: 'Always secure your king via castling early, and watch for en passant when pushing pawns two squares.',
  },
  // 2. Tactics
  {
    id: 'lesson-forks-and-pins',
    category: 'tactics',
    categoryLabel: 'Tactics',
    title: 'Forks, Pins, and Skewers',
    subtitle: 'The foundational weapons of chess tactical mastery.',
    durationMinutes: 6,
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5',
    content: [
      'A Fork occurs when a single piece attacks two or more enemy targets at the same time. Knights and Pawns are especially lethal fork deliverers because their attack patterns cannot be blocked.',
      'An Absolute Pin happens when a pinned piece shields the King; moving that piece would be illegal. A Relative Pin involves a higher-value piece (like the Queen) where moving the piece is legal but disastrous.',
      'A Skewer attacks the more valuable piece in front (e.g. King), forcing it to move and exposing a lesser-value piece behind it to capture.',
      'Tactical Vision: Always scan for undefended pieces ("LPDO" - Loose Pieces Drop Off).',
    ],
    keyTakeaway: 'Look for aligned targets on ranks, files, and diagonals to unleash double attacks.',
  },
  // 3. Openings
  {
    id: 'lesson-opening-principles',
    category: 'openings',
    categoryLabel: 'Openings',
    title: 'The Golden Opening Principles',
    subtitle: 'How to emerge from the opening with an active, coordinated, and winning army.',
    durationMinutes: 4,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 3',
    content: [
      '1. Control the Center: The four central squares (e4, d4, e5, d5) govern the entire board. Every piece placed or aimed at the center enjoys maximum mobility.',
      '2. Develop Knights before Bishops: Knights have fewer viable squares and thrive from standard development posts (f3, c3, f6, c6), while bishops can choose long diagonals.',
      '3. Do Not Move the Same Piece Twice: In the opening, time is precious. Every repeated move is a gift of free development tempo to your opponent.',
      '4. Castle Within the First 10 Moves: Safeguard your King and connect your Rooks.',
      '5. Keep the Queen at Bay: Bringing your Queen out too early makes her an easy target for enemy minor pieces developing with tempo.',
    ],
    keyTakeaway: 'Development and king safety outrank premature material grabbing in 90% of openings.',
  },
  // 4. Notation
  {
    id: 'lesson-algebraic-notation',
    category: 'notation',
    categoryLabel: 'Notation',
    title: 'Reading and Writing SAN & PGN',
    subtitle: 'The universal language of chess literature and digital competition.',
    durationMinutes: 4,
    content: [
      'Standard Algebraic Notation (SAN) identifies every square using coordinates: files a–h (left to right) and ranks 1–8 (White\'s first rank to Black\'s first rank).',
      'Piece Symbols: K = King, Q = Queen, R = Rook, B = Bishop, N = Knight (Pawns have no capital letter, designated only by target square e.g. e4).',
      'Special Symbols: "x" for capture (e.g. Bxe5, exd5), "+" for check, "#" for checkmate, "O-O" for kingside castle, "O-O-O" for queenside castle.',
      'Disambiguation: When two identical pieces can move to the same square, specify the originating file or rank (e.g. Nbd7 or R1e2).',
      'PGN (Portable Game Notation): The universal digital format encoding game headers (Event, Site, Date, White, Black, Result) and SAN moves.',
    ],
    keyTakeaway: 'Accurate notation preserves games for review and engine-assisted post-mortem analysis.',
  },
  // 5. Endgames
  {
    id: 'lesson-essential-endgames',
    category: 'endgames',
    categoryLabel: 'Endgames',
    title: 'Essential Endgame Technique & Opposition',
    subtitle: 'Transform small advantages into clean, unstoppable victories.',
    durationMinutes: 7,
    fen: '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1',
    content: [
      'The Opposition: When two kings face each other on the same rank or file with one square between them. The player who does NOT have to move holds the opposition.',
      'King Activity: In the endgame, the King transitions from a vulnerable monarch to an aggressive, attacking combat piece. Centralize your King aggressively!',
      'Rook Endgames: Account for over 50% of all chess endgames. The fundamental rule of rooks: "Place your rooks behind passed pawns", whether your own or the opponent\'s.',
      'The Square Rule: Quickly calculate if your King can catch an enemy passed pawn without counting every step by drawing a diagonal square to the promotion rank.',
    ],
    keyTakeaway: 'Endgame mastery requires precise king opposition and relentless passed pawn escort.',
  },
];
