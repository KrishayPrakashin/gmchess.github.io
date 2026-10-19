import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { CHESS_PUZZLES } from '../chess/puzzles';
import { Puzzle } from '../types/chess';
import { Chessboard } from './Chessboard';
import { storage, PuzzleProgress } from '../storage/db';
import { sound } from '../chess/sound';
import {
  Trophy,
  Flame,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';

interface PuzzleTrainerProps {
  boardTheme: any;
  pieceTheme: any;
  showCoordinates: boolean;
  showLegalMoves: boolean;
}

export const PuzzleTrainer: React.FC<PuzzleTrainerProps> = ({
  boardTheme,
  pieceTheme,
  showCoordinates,
  showLegalMoves,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle>(CHESS_PUZZLES[0]);
  const [puzzleGame, setPuzzleGame] = useState<Chess>(() => new Chess(CHESS_PUZZLES[0].fen));
  const [solutionStep, setSolutionStep] = useState(0);
  const [status, setStatus] = useState<'solving' | 'correct' | 'failed'>('solving');
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [progress, setProgress] = useState<PuzzleProgress>(() => storage.getPuzzleProgress());
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Load selected puzzle
  const loadPuzzle = (idx: number) => {
    const selected = CHESS_PUZZLES[idx % CHESS_PUZZLES.length];
    setCurrentIdx(idx % CHESS_PUZZLES.length);
    setPuzzle(selected);
    setPuzzleGame(new Chess(selected.fen));
    setSolutionStep(0);
    setStatus('solving');
    setShowHint(false);
    setShowExplanation(false);
    setLastMove(null);
  };

  const handleRetry = () => {
    setPuzzleGame(new Chess(puzzle.fen));
    setSolutionStep(0);
    setStatus('solving');
    setShowExplanation(false);
    setLastMove(null);
  };

  const handleNextPuzzle = () => {
    loadPuzzle(currentIdx + 1);
  };

  // Handle player attempt on puzzle board
  const handlePuzzleMove = (moveAttempt: { from: Square; to: Square; promotion?: string }): boolean => {
    if (status !== 'solving') return false;

    const gameCopy = new Chess(puzzleGame.fen());
    let executedMove;
    try {
      executedMove = gameCopy.move({
        from: moveAttempt.from,
        to: moveAttempt.to,
        promotion: moveAttempt.promotion || 'q',
      });
    } catch {
      sound.playIllegal();
      return false;
    }

    if (!executedMove) return false;

    // Check against puzzle solution
    const expectedMoveSan = puzzle.solution[solutionStep];

    if (puzzle.solution.length === 0) {
      // Stalemate / defensive claim puzzle
      setStatus('correct');
      sound.playVictory();
      const updated = storage.recordPuzzleSolved(puzzle.id);
      setProgress(updated);
      return false;
    }

    if (executedMove.san === expectedMoveSan) {
      // Correct player move
      setPuzzleGame(gameCopy);
      setLastMove({ from: moveAttempt.from, to: moveAttempt.to });
      sound.playMove();

      const nextStep = solutionStep + 1;

      // Check if puzzle fully solved
      if (nextStep >= puzzle.solution.length) {
        setStatus('correct');
        sound.playVictory();
        const updated = storage.recordPuzzleSolved(puzzle.id);
        setProgress(updated);
      } else {
        // Automatically play computer response half-move
        setSolutionStep(nextStep);
        setTimeout(() => {
          const compSan = puzzle.solution[nextStep];
          const autoMove = gameCopy.move(compSan);
          if (autoMove) {
            setPuzzleGame(new Chess(gameCopy.fen()));
            setLastMove({ from: autoMove.from as Square, to: autoMove.to as Square });
            sound.playMove();
            setSolutionStep(nextStep + 1);
          }
        }, 500);
      }
      return true;
    } else {
      // Incorrect move
      sound.playIllegal();
      setStatus('failed');
      storage.resetPuzzleStreak();
      setProgress(storage.getPuzzleProgress());
      return false;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Tactical Board */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full max-w-[min(82vw,560px)]">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {puzzle.themeLabel}
              </span>
              <span className="text-xs font-mono text-slate-400">Rating {puzzle.rating}</span>
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {puzzle.turn === 'w' ? 'White to move and win' : 'Black to move and win'}
            </span>
          </div>

          <Chessboard
            game={puzzleGame}
            onMove={handlePuzzleMove}
            flipped={puzzle.turn === 'b'}
            boardTheme={boardTheme}
            pieceTheme={pieceTheme}
            showCoordinates={showCoordinates}
            showLegalMoves={showLegalMoves}
            lastMove={lastMove}
            interactive={status === 'solving'}
          />
        </div>
      </div>

      {/* Right: Puzzle Status, Clues, and Stats */}
      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Header with Title and Streak */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-mono text-slate-500">
              Puzzle {currentIdx + 1} of {CHESS_PUZZLES.length}
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{puzzle.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300">
              {progress.streak} <span className="text-[10px] text-amber-400/70 font-normal">streak</span>
            </span>
          </div>
        </div>

        {/* Status Alert Banner */}
        {status === 'solving' && (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Find the best tactical continuation.</span>
            <span className="font-mono text-amber-400 font-bold">
              Step {solutionStep + 1} / {Math.max(1, puzzle.solution.length)}
            </span>
          </div>
        )}

        {status === 'correct' && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Brilliant! Puzzle Solved Successfully.</span>
            </div>
            <p className="text-[11px] text-emerald-300/90">{puzzle.explanation}</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <XCircle className="w-4 h-4" />
              <span>Not quite. That wasn't the winning move.</span>
            </div>
            <p className="text-[11px] text-rose-300/80">Try again or check the tactical hint below.</p>
          </div>
        )}

        {/* Hint Accordion */}
        {showHint ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Tactical Clue:
            </span>
            <p className="text-[11px] text-amber-200/90">{puzzle.hint}</p>
          </div>
        ) : (
          <button
            onClick={() => setShowHint(true)}
            className="w-full py-2 px-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Need a Hint?</span>
          </button>
        )}

        {/* Reveal Solution Button */}
        {status === 'failed' && !showExplanation && (
          <button
            onClick={() => setShowExplanation(true)}
            className="w-full py-2 px-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-amber-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show Solution & Explanation</span>
          </button>
        )}

        {showExplanation && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="text-amber-400 font-bold font-mono">
              Solution: {puzzle.solution.join(' ')}
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{puzzle.explanation}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleRetry}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Position</span>
          </button>

          <button
            onClick={handleNextPuzzle}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <span>Next Puzzle</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Lifetime Stats */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            Best Streak: <strong className="text-white">{progress.bestStreak}</strong>
          </span>
          <span>
            Solved: <strong className="text-white">{progress.completedPuzzleIds.length}</strong> / {CHESS_PUZZLES.length}
          </span>
        </div>
      </div>
    </div>
  );
};
