import { Puzzle } from '../types/chess';

export const CHESS_PUZZLES: Puzzle[] = [
  // 1. Mate in 1
  {
    id: 'puzzle-mate-1-scholar',
    title: "The Scholar's Decisive Blow",
    theme: 'mate1',
    themeLabel: 'Mate in 1',
    rating: 800,
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5',
    turn: 'w',
    solution: ['Qxf7#'],
    hint: 'Look for the weak f7 square protected only by the enemy king.',
    explanation: 'The queen delivers checkmate supported by the light-squared bishop on c4. The Black king has no legal squares and cannot capture the queen.',
  },
  {
    id: 'puzzle-mate-1-back-rank',
    title: 'Corridor Back Rank Mate',
    theme: 'mate1',
    themeLabel: 'Mate in 1',
    rating: 950,
    fen: '6k1/5ppp/8/8/8/8/4rPPP/2R3K1 w - - 0 1',
    turn: 'w',
    solution: ['Rc8+'],
    hint: 'Black pawns trap their own king on the 8th rank.',
    explanation: 'Rc8+ forces checkmate because Black has no luft (escape square). Re8 is met by Rxe8#.',
  },

  // 2. Mate in 2
  {
    id: 'puzzle-mate-2-anastasia',
    title: "Anastasia's Mate Motif",
    theme: 'mate2',
    themeLabel: 'Mate in 2',
    rating: 1350,
    fen: '5rk1/1p3ppp/pN6/8/8/8/5PPP/3RR1K1 w - - 0 1',
    turn: 'w',
    solution: ['Rd8', 'Rxd8', 'Rxd8#'],
    hint: 'Force open or clear the 8th rank with an overwhelming rook invasion.',
    explanation: 'Rd8 forces Black to trade rooks on the back rank, leaving White with an unstoppable checkmate.',
  },
  {
    id: 'puzzle-mate-2-smothered-prep',
    title: 'Queen Sacrifice for Checkmate',
    theme: 'mate2',
    themeLabel: 'Mate in 2',
    rating: 1400,
    fen: 'r4rk1/ppp2ppp/8/8/8/2B5/PPP2PPP/3R2K1 w - - 0 1',
    turn: 'w',
    solution: ['Rd7'],
    hint: 'Infiltrate the 7th rank with absolute dominance.',
    explanation: 'Placing the rook on the 7th rank paralyzes Black\'s defense and seals the endgame.',
  },

  // 3. Knight & Queen Forks
  {
    id: 'puzzle-fork-royal',
    title: 'The Royal Family Fork',
    theme: 'fork',
    themeLabel: 'Fork',
    rating: 1100,
    fen: 'r3k2r/ppp2ppp/2n5/3q4/3P4/5N2/PP1N1PPP/R2QK2R w KQkq - 0 12',
    turn: 'w',
    solution: ['Qe2+'],
    hint: 'Step into the center with check and fork the undefended piece.',
    explanation: 'Qe2+ simultaneously checks Black\'s uncastled king and creates a winning positional advantage.',
  },
  {
    id: 'puzzle-fork-knight-c7',
    title: 'Triple Fork on c7',
    theme: 'fork',
    themeLabel: 'Fork',
    rating: 1250,
    fen: 'r1bqkb1r/pp1p1ppp/2n1pn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 2 6',
    turn: 'w',
    solution: ['Ndb5'],
    hint: 'Threaten the devastating Nc7+ fork targeting King and Rook.',
    explanation: 'Ndb5 creates an unstoppable threat on c7. Black cannot defend both d6 and c7 without concessions.',
  },

  // 4. Absolute & Relative Pins
  {
    id: 'puzzle-pin-absolute',
    title: 'The Absolute Queen Pin',
    theme: 'pin',
    themeLabel: 'Pin',
    rating: 1200,
    fen: '4k3/4q3/8/8/4R3/8/5PPP/6K1 w - - 0 1',
    turn: 'w',
    solution: ['Rxe7+'],
    hint: 'The Black queen cannot move off the file because of the king behind it.',
    explanation: 'Rxe7+ captures Black\'s pinned queen for a rook, leaving White with an easily winning king and pawn endgame.',
  },
  {
    id: 'puzzle-pin-diagonal',
    title: 'Bishop Pin on the Long Diagonal',
    theme: 'pin',
    themeLabel: 'Pin',
    rating: 1300,
    fen: 'r1bq1rk1/pp2ppbp/2n2np1/3p4/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10',
    turn: 'w',
    solution: ['Nxc6'],
    hint: 'Damage Black\'s pawn structure while maintaining pressure on d5.',
    explanation: 'Nxc6 bxc6 simplifies while creating isolated and backward pawn liabilities for Black.',
  },

  // 5. Skewers
  {
    id: 'puzzle-skewer-rook',
    title: 'Classical Rook Skewer',
    theme: 'skewer',
    themeLabel: 'Skewer',
    rating: 1250,
    fen: '8/8/4k3/8/8/8/r7/1R2K3 w - - 0 1',
    turn: 'w',
    solution: ['Rb6+'],
    hint: 'Check the king along the rank to reveal the prize behind it.',
    explanation: 'Rb6+ forces the Black king to move, exposing the rear target and securing White active counterplay.',
  },

  // 6. Discovered Attacks
  {
    id: 'puzzle-discovered-check',
    title: 'Discovered Check with Knight Jump',
    theme: 'discovered',
    themeLabel: 'Discovered Attack',
    rating: 1450,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 1 5',
    turn: 'w',
    solution: ['Bd2'],
    hint: 'Break the pin cleanly and prepare central liberation.',
    explanation: 'Bd2 breaks the pin on the c3 knight, allowing White to castle smoothly and challenge the center.',
  },

  // 7. Defensive Tactics
  {
    id: 'puzzle-defensive-stalemate',
    title: 'The Desperado Stalemate Trap',
    theme: 'defensive',
    themeLabel: 'Defensive Tactics',
    rating: 1550,
    fen: '7k/7P/6K1/8/8/8/8/8 b - - 0 1',
    turn: 'b',
    solution: [], // Drawn position
    hint: 'When having no legal moves and not in check, a draw is secured.',
    explanation: 'The Black king has no legal moves and is not in check. The game concludes immediately in a stalemate draw!',
  },

  // 8. Endgames
  {
    id: 'puzzle-endgame-lucena',
    title: 'The Lucena Position Bridge',
    theme: 'endgame',
    themeLabel: 'Endgame Technique',
    rating: 1650,
    fen: '1K1k4/1P6/8/8/8/8/7r/5R2 w - - 0 1',
    turn: 'w',
    solution: ['Rf4'],
    hint: 'Build the bridge on the 4th rank to shield your king from checks.',
    explanation: 'The Lucena position is the cornerstone of rook endgames: Rf4 allows the king to escape while the rook blocks Black\'s lateral checks.',
  },
];
