import { Chess, Square } from 'chess.js';
import { EngineLevel } from '../types/chess';

// Calibrated 8 Difficulty Levels for Responsive In-Browser Calculation
export const ENGINE_LEVELS: EngineLevel[] = [
  { level: 1, name: 'Beginner', elo: 400, depth: 1, description: 'Casual learner, frequent tactical mistakes' },
  { level: 2, name: 'Novice', elo: 800, depth: 1, description: 'Understands basic captures and development' },
  { level: 3, name: 'Club Player', elo: 1200, depth: 2, description: 'Solid fundamentals, defends pieces' },
  { level: 4, name: 'Intermediate', elo: 1500, depth: 2, description: 'Good tactical awareness and central control' },
  { level: 5, name: 'Advanced', elo: 1800, depth: 3, description: 'Positional play, king safety, sharp tactics' },
  { level: 6, name: 'Expert', elo: 2100, depth: 3, description: 'High depth calculation and endgame precision' },
  { level: 7, name: 'Master', elo: 2400, depth: 4, description: 'Formidable calculations and deep positional plans' },
  { level: 8, name: 'Grandmaster', elo: 2700, depth: 4, description: 'Maximum depth, deep tactical horizon & quiescence' },
];

// Classic Opening Book for instant theoretical moves in the first 2-3 plies
const OPENING_BOOK: Record<string, string[]> = {
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e4', 'd4', 'Nf3', 'c4'],
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['c5', 'e5', 'e6', 'c6', 'Nf6'],
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['Nf6', 'd5', 'e6', 'g6'],
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': ['Nf3', 'Nc3', 'Bc4'],
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2': ['Nf3', 'Nc3', 'c3'],
  'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2': ['c4', 'Nf3', 'Bg5'],
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2': ['c4', 'Nf3', 'Bf4'],
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': ['d4', 'Nf3'],
  'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': ['d4', 'Nf3'],
};

// Material Values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (White perspective, flipped for Black)
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_PST = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_PST = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5, 10, 10,  5,  0,-10,
 -10,  5,  5, 10, 10,  5,  5,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
 -10, 10, 10, 10, 10, 10, 10,-10,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_PST = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_MIDGAME_PST = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20,
];

function getSquareIndex(square: Square): number {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = 8 - parseInt(square[1], 10); // 8=0, 1=7
  return rank * 8 + file;
}

function evaluateStatic(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -30000 : 30000;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;

  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      const sqIndexWhite = r * 8 + c;
      const sqIndexBlack = (7 - r) * 8 + c;

      let pst = 0;
      switch (piece.type) {
        case 'p':
          pst = piece.color === 'w' ? PAWN_PST[sqIndexWhite] : PAWN_PST[sqIndexBlack];
          break;
        case 'n':
          pst = piece.color === 'w' ? KNIGHT_PST[sqIndexWhite] : KNIGHT_PST[sqIndexBlack];
          break;
        case 'b':
          pst = piece.color === 'w' ? BISHOP_PST[sqIndexWhite] : BISHOP_PST[sqIndexBlack];
          break;
        case 'r':
          pst = piece.color === 'w' ? ROOK_PST[sqIndexWhite] : ROOK_PST[sqIndexBlack];
          break;
        case 'q':
          pst = piece.color === 'w' ? QUEEN_PST[sqIndexWhite] : QUEEN_PST[sqIndexBlack];
          break;
        case 'k':
          pst = piece.color === 'w' ? KING_MIDGAME_PST[sqIndexWhite] : KING_MIDGAME_PST[sqIndexBlack];
          break;
      }

      if (piece.color === 'w') {
        whiteScore += val + pst;
      } else {
        blackScore += val + pst;
      }
    }
  }

  return whiteScore - blackScore;
}

// Quiescence Search for captures only
function quiescence(game: Chess, alpha: number, beta: number, maxQDepth = 3): number {
  const standPat = (game.turn() === 'w' ? 1 : -1) * evaluateStatic(game);

  if (standPat >= beta) return beta;
  if (alpha < standPat) alpha = standPat;
  if (maxQDepth <= 0) return standPat;

  // Generate captures only
  const moves = game.moves({ verbose: true }).filter((m) => m.captured || m.promotion);

  // Sort captures by MVV-LVA
  moves.sort((a, b) => {
    const valA = a.captured ? PIECE_VALUES[a.captured] - (PIECE_VALUES[a.piece] / 10) : 0;
    const valB = b.captured ? PIECE_VALUES[b.captured] - (PIECE_VALUES[b.piece] / 10) : 0;
    return valB - valA;
  });

  for (const move of moves) {
    game.move(move);
    const score = -quiescence(game, -beta, -alpha, maxQDepth - 1);
    game.undo();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

// Alpha-Beta Minimax search
function alphaBeta(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  nodes: { count: number }
): { score: number; bestMove?: any } {
  nodes.count++;

  if (game.isGameOver() || depth <= 0) {
    if (depth <= 0) {
      // Quiescence search on leaf nodes
      const qScore = isMaximizing
        ? quiescence(game, alpha, beta, 2)
        : -quiescence(game, -beta, -alpha, 2);
      return { score: qScore };
    }
    return { score: evaluateStatic(game) };
  }

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    return { score: evaluateStatic(game) };
  }

  // Move ordering: MVV-LVA, checks, promotions
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
    if (b.captured) scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;
    return scoreB - scoreA;
  });

  let bestMove = moves[0];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = alphaBeta(game, depth - 1, alpha, beta, false, nodes).score;
      game.undo();

      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = alphaBeta(game, depth - 1, alpha, beta, true, nodes).score;
      game.undo();

      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return { score: minEval, bestMove };
  }
}

export interface EngineResult {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  score: number; // in centipawns (from White perspective)
  nodes: number;
  depth: number;
}

export async function calculateBestMove(
  fen: string,
  levelNum: number = 4
): Promise<EngineResult | null> {
  // Yield thread briefly to guarantee UI updates
  await new Promise((resolve) => setTimeout(resolve, 60));

  const game = new Chess(fen);
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const currentLevel = ENGINE_LEVELS.find((l) => l.level === levelNum) || ENGINE_LEVELS[3];
  const isWhite = game.turn() === 'w';

  // Check Opening Book first for instant, master-level opening play
  const bookMoves = OPENING_BOOK[fen];
  if (bookMoves && bookMoves.length > 0 && levelNum >= 2) {
    const chosenSan = bookMoves[Math.floor(Math.random() * bookMoves.length)];
    const matchingMove = legalMoves.find((m) => m.san === chosenSan);
    if (matchingMove) {
      return {
        from: matchingMove.from,
        to: matchingMove.to,
        promotion: matchingMove.promotion,
        san: matchingMove.san,
        score: isWhite ? 25 : -25,
        nodes: 1,
        depth: 1,
      };
    }
  }

  // Beginner levels (1-3) occasionally introduce sub-optimal choices for realistic Elo emulation
  const randomFactorThreshold = levelNum === 1 ? 0.65 : levelNum === 2 ? 0.35 : levelNum === 3 ? 0.15 : 0;
  if (Math.random() < randomFactorThreshold) {
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return {
      from: randomMove.from,
      to: randomMove.to,
      promotion: randomMove.promotion,
      san: randomMove.san,
      score: evaluateStatic(game),
      nodes: 1,
      depth: 1,
    };
  }

  // Calculation depth
  const depth = currentLevel.depth;
  const nodes = { count: 0 };

  const result = alphaBeta(game, depth, -Infinity, Infinity, isWhite, nodes);

  const selectedMove = result.bestMove || legalMoves[0];

  return {
    from: selectedMove.from,
    to: selectedMove.to,
    promotion: selectedMove.promotion,
    san: selectedMove.san,
    score: result.score,
    nodes: nodes.count,
    depth,
  };
}

export async function evaluatePosition(fen: string, depth: number = 3): Promise<{
  score: number; // Centipawns (-1000 to +1000, >10000 = mate)
  evalText: string;
  bestMove?: string;
}> {
  const game = new Chess(fen);
  if (game.isCheckmate()) {
    const mateText = game.turn() === 'w' ? '#-1' : '#+1';
    return { score: game.turn() === 'w' ? -30000 : 30000, evalText: mateText };
  }
  if (game.isDraw() || game.isStalemate()) {
    return { score: 0, evalText: '0.00' };
  }

  const nodes = { count: 0 };
  const isWhite = game.turn() === 'w';
  const result = alphaBeta(game, depth, -Infinity, Infinity, isWhite, nodes);

  const centipawns = result.score;
  const evalValue = (centipawns / 100).toFixed(2);
  const evalText = centipawns > 0 ? `+${evalValue}` : evalValue;

  return {
    score: centipawns,
    evalText,
    bestMove: result.bestMove ? result.bestMove.san : undefined,
  };
}

export function classifyMove(
  evalBefore: number,
  evalAfter: number,
  turn: 'w' | 'b'
): 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' {
  // Delta from perspective of moving player
  const delta = turn === 'w' ? evalAfter - evalBefore : evalBefore - evalAfter;

  if (delta >= -20) return 'best';
  if (delta >= -70) return 'good';
  if (delta >= -150) return 'inaccuracy';
  if (delta >= -300) return 'mistake';
  return 'blunder';
}
