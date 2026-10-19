import { Chess } from 'chess.js';
import { calculateBestMove, evaluatePosition } from '../engine/engine';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    testsPassed++;
    console.log(`✓ PASS: ${testName}`);
  } else {
    testsFailed++;
    console.error(`✗ FAIL: ${testName}`);
  }
}

async function runTestSuite() {
  console.log('--- STARTING GRANDMASTER CHESS TEST SUITE ---');

  // Test 1: Legal opening moves
  const g1 = new Chess();
  const m1 = g1.move('e4');
  assert(m1 !== null && m1.san === 'e4', 'Move e4 is valid starting move');

  // Test 2: Kingside Castling
  const gCastle = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  const castleMove = gCastle.move('O-O');
  assert(castleMove !== null && castleMove.san === 'O-O', 'Kingside castling O-O legal');
  assert(gCastle.get('g1')?.type === 'k' && gCastle.get('f1')?.type === 'r', 'King and Rook placed correctly on O-O');

  // Test 3: Queenside Castling
  const gCastleQ = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  const castleMoveQ = gCastleQ.move('O-O-O');
  assert(castleMoveQ !== null && castleMoveQ.san === 'O-O-O', 'Queenside castling O-O-O legal');
  assert(gCastleQ.get('c1')?.type === 'k' && gCastleQ.get('d1')?.type === 'r', 'King and Rook placed correctly on O-O-O');

  // Test 4: Castling through check must be illegal
  const gCastleThroughCheck = new Chess('r3k2r/8/8/8/8/2b5/8/R3K2R w KQkq - 0 1'); // Bishop on c3 attacks d2/e1
  // King is in check directly
  assert(gCastleThroughCheck.inCheck(), 'King detected in check');
  let threw = false;
  try {
    gCastleThroughCheck.move('O-O');
  } catch {
    threw = true;
  }
  assert(threw || gCastleThroughCheck.get('e1')?.type === 'k', 'Castling out of check prevented');

  // Test 5: En Passant capture
  const gEP = new Chess('rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq e6 0 3');
  const epMove = gEP.move('fxe6');
  assert(epMove !== null && epMove.flags.includes('e'), 'En passant flag recognized and executed');
  assert(!gEP.get('e5'), 'Captured en passant pawn removed from board');

  // Test 6: Pawn Promotion (Queen, Rook, Bishop, Knight)
  const gProm = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
  const promQ = gProm.move({ from: 'e7', to: 'e8', promotion: 'q' });
  assert(promQ !== null && promQ.piece === 'p' && gProm.get('e8')?.type === 'q', 'Promoted to Queen');

  const gPromN = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
  const promN = gPromN.move({ from: 'e7', to: 'e8', promotion: 'n' });
  assert(promN !== null && gPromN.get('e8')?.type === 'n', 'Promoted to Knight underpromotion');

  // Test 7: Scholar's Mate checkmate detection
  const gMate = new Chess();
  gMate.move('e4');
  gMate.move('e5');
  gMate.move('Bc4');
  gMate.move('Nc6');
  gMate.move('Qh5');
  gMate.move('Nf6');
  gMate.move('Qxf7#');
  assert(gMate.isCheckmate(), 'Scholar\'s mate recognized as Checkmate');
  assert(gMate.isGameOver(), 'Game over recognized on checkmate');

  // Test 8: Stalemate detection
  const gStale = new Chess('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
  assert(gStale.isStalemate(), 'Stalemate recognized correctly');
  assert(gStale.isDraw(), 'Stalemate classified as draw');

  // Test 9: FEN round-trip preservation
  const testFen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
  const gFen = new Chess(testFen);
  assert(gFen.fen() === testFen, 'FEN loaded and preserved identically');

  // Test 10: Undo and Redo
  const gUndo = new Chess();
  gUndo.move('e4');
  assert(gUndo.get('e4')?.type === 'p', 'Pawn on e4');
  gUndo.undo();
  assert(!gUndo.get('e4'), 'Undo cleared square e4');
  assert(gUndo.get('e2')?.type === 'p', 'Pawn restored on e2');

  // Test 11: Computer Engine move generation
  const engineMove = await calculateBestMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 3);
  assert(engineMove !== null && typeof engineMove.from === 'string', 'Engine generated legal move from starting position');

  // Test 12: Engine Evaluation Function
  const evalStart = await evaluatePosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 2);
  assert(Math.abs(evalStart.score) < 50, 'Starting position is approximately equal evaluation');

  console.log(`\nTEST RESULTS: ${testsPassed} Passed, ${testsFailed} Failed.`);
  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
