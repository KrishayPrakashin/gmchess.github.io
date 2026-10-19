/**
 * Grandmaster Chess: Complete Cross-Platform Chess Ecosystem
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import {
  GameMode,
  TimeControlKey,
  PieceColor,
  PieceType,
  UserSettings,
  MoveRecord,
  SavedGame,
  OpeningVariation,
} from './types/chess';
import { storage, DEFAULT_SETTINGS, ActiveGameState } from './storage/db';
import { calculateBestMove, evaluatePosition, classifyMove, ENGINE_LEVELS } from './engine/engine';
import { sound } from './chess/sound';
import { Navigation, MainTab } from './components/Navigation';
import { Chessboard } from './components/Chessboard';
import { Clock } from './components/Clock';
import { CapturedPieces } from './components/CapturedPieces';
import { MoveHistory } from './components/MoveHistory';
import { AnalysisPanel } from './components/AnalysisPanel';
import { PuzzleTrainer } from './components/PuzzleTrainer';
import { OpeningExplorer } from './components/OpeningExplorer';
import { LessonsView } from './components/LessonsView';
import { GameHistoryView } from './components/GameHistoryView';
import { NewGameModal, TIME_CONTROLS } from './components/NewGameModal';
import { SettingsModal } from './components/SettingsModal';
import { CustomPositionDialog } from './components/CustomPositionDialog';
import { CrossPlatformModal } from './components/CrossPlatformModal';
import { OfflineIndicator } from './components/PWAInstallButton';
import {
  RotateCcw,
  Flag,
  Handshake,
  ArrowUpDown,
  SlidersHorizontal,
  Bot,
  User,
  Sparkles,
  Info,
} from 'lucide-react';

export default function App() {
  // --- Persistent Settings ---
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());

  // --- Active Navigation Tab ---
  const [currentTab, setCurrentTab] = useState<MainTab>('play');

  // --- Modals State ---
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCustomPosModalOpen, setIsCustomPosModalOpen] = useState(false);
  const [isCrossPlatformOpen, setIsCrossPlatformOpen] = useState(false);

  // --- Core Game State ---
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [gameMode, setGameMode] = useState<GameMode>('vs_computer');
  const [timeControl, setTimeControl] = useState<TimeControlKey>('5+3');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [engineLevel, setEngineLevel] = useState<number>(() => settings.engineLevel);

  // Board presentation
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [historyRecords, setHistoryRecords] = useState<MoveRecord[]>([]);
  const [activeMoveIndex, setActiveMoveIndex] = useState<number>(-1);

  // Clocks
  const [whiteTimeMs, setWhiteTimeMs] = useState(300000);
  const [blackTimeMs, setBlackTimeMs] = useState(300000);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const lastTickTimestampRef = useRef<number | null>(null);

  // Engine status
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const isEngineThinkingRef = useRef(false);

  // Game over state
  const [gameOverResult, setGameOverResult] = useState<{
    title: string;
    description: string;
    resultCode: string;
  } | null>(null);

  // Draw offer pending
  const [drawOfferPending, setDrawOfferPending] = useState(false);

  // Initialize sound settings
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // Sync board flipping with player color preference in vs_computer mode
  useEffect(() => {
    if (gameMode === 'vs_computer') {
      setBoardFlipped(playerColor === 'b');
    }
  }, [gameMode, playerColor]);

  // Compute captured pieces & material difference
  const { whiteCaptured, blackCaptured, materialAdvantage } = React.useMemo(() => {
    const startCounts: Record<PieceType, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
    const currentCounts: { w: Record<PieceType, number>; b: Record<PieceType, number> } = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    const board = game.board();
    for (const row of board) {
      for (const piece of row) {
        if (piece) {
          currentCounts[piece.color][piece.type]++;
        }
      }
    }

    const whiteCaps: PieceType[] = [];
    const blackCaps: PieceType[] = [];

    (['q', 'r', 'b', 'n', 'p'] as PieceType[]).forEach((type) => {
      const missingWhite = startCounts[type] - currentCounts.w[type];
      for (let i = 0; i < missingWhite; i++) blackCaps.push(type); // Black captured White pieces

      const missingBlack = startCounts[type] - currentCounts.b[type];
      for (let i = 0; i < missingBlack; i++) whiteCaps.push(type); // White captured Black pieces
    });

    const values: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let whiteScore = 0;
    let blackScore = 0;
    whiteCaps.forEach((p) => (whiteScore += values[p]));
    blackCaps.forEach((p) => (blackScore += values[p]));

    return {
      whiteCaptured: whiteCaps,
      blackCaptured: blackCaps,
      materialAdvantage: {
        white: Math.max(0, whiteScore - blackScore),
        black: Math.max(0, blackScore - whiteScore),
      },
    };
  }, [game.fen()]);

  // Save active game state
  useEffect(() => {
    if (gameMode !== 'puzzles' && gameMode !== 'openings' && !gameOverResult) {
      const state: ActiveGameState = {
        fen: game.fen(),
        history: historyRecords.map((m) => m.san),
        turn: game.turn(),
        whiteTimeMs,
        blackTimeMs,
        timeControl,
        mode: gameMode,
        playerColor,
        engineLevel,
        lastUpdated: Date.now(),
      };
      storage.saveActiveGame(state);
    }
  }, [game.fen(), whiteTimeMs, blackTimeMs, gameMode, gameOverResult, engineLevel, playerColor, timeControl, historyRecords]);

  // Timer Tick Loop with Wall-Clock Delta Precision (No tab background drift)
  useEffect(() => {
    if (!isClockRunning || timeControl === 'unlimited' || gameOverResult) {
      lastTickTimestampRef.current = null;
      return;
    }

    lastTickTimestampRef.current = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      const lastTick = lastTickTimestampRef.current || now;
      const delta = now - lastTick;
      lastTickTimestampRef.current = now;

      if (game.turn() === 'w') {
        setWhiteTimeMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            handleTimeout('w');
            return 0;
          }
          return next;
        });
      } else {
        setBlackTimeMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            handleTimeout('b');
            return 0;
          }
          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isClockRunning, game.turn(), timeControl, gameOverResult]);

  // Timeout handler
  const handleTimeout = (timedOutColor: PieceColor) => {
    setIsClockRunning(false);
    const winnerColor = timedOutColor === 'w' ? 'Black' : 'White';
    const winnerCode = timedOutColor === 'w' ? '0-1' : '1-0';
    sound.playGameOver();

    const finish = {
      title: `${winnerColor} Won on Time`,
      description: `${timedOutColor === 'w' ? 'White' : 'Black'} ran out of time on the clock.`,
      resultCode: winnerCode,
    };
    setGameOverResult(finish);
    archiveCompletedGame(winnerCode);
  };

  // Archive completed game to history
  const archiveCompletedGame = (resultCode: string) => {
    const saved: SavedGame = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      mode: gameMode,
      white: gameMode === 'vs_computer' && playerColor === 'b' ? `Computer (${ENGINE_LEVELS[engineLevel - 1]?.elo})` : 'Player',
      black: gameMode === 'vs_computer' && playerColor === 'w' ? `Computer (${ENGINE_LEVELS[engineLevel - 1]?.elo})` : 'Opponent',
      result: resultCode,
      moves: historyRecords.map((m) => m.san),
      pgn: game.pgn(),
      timeControl,
    };
    storage.saveCompletedGame(saved);
  };

  // Check Game End Conditions
  const checkGameEndStatus = useCallback(
    (currentGame: Chess): boolean => {
      if (currentGame.isCheckmate()) {
        const winner = currentGame.turn() === 'w' ? 'Black' : 'White';
        const code = currentGame.turn() === 'w' ? '0-1' : '1-0';
        sound.playVictory();
        setGameOverResult({
          title: `Checkmate! ${winner} Wins`,
          description: `${winner} delivered a decisive checkmate.`,
          resultCode: code,
        });
        archiveCompletedGame(code);
        setIsClockRunning(false);
        return true;
      }

      if (currentGame.isStalemate()) {
        sound.playGameOver();
        setGameOverResult({
          title: 'Draw by Stalemate',
          description: 'The player to move has no legal moves and their king is not in check.',
          resultCode: '1/2-1/2',
        });
        archiveCompletedGame('1/2-1/2');
        setIsClockRunning(false);
        return true;
      }

      if (currentGame.isThreefoldRepetition()) {
        sound.playGameOver();
        setGameOverResult({
          title: 'Draw by Threefold Repetition',
          description: 'The exact same position occurred 3 times on the board.',
          resultCode: '1/2-1/2',
        });
        archiveCompletedGame('1/2-1/2');
        setIsClockRunning(false);
        return true;
      }

      if (currentGame.isInsufficientMaterial()) {
        sound.playGameOver();
        setGameOverResult({
          title: 'Draw by Insufficient Material',
          description: 'Neither player has enough pieces remaining to deliver checkmate.',
          resultCode: '1/2-1/2',
        });
        archiveCompletedGame('1/2-1/2');
        setIsClockRunning(false);
        return true;
      }

      return false;
    },
    [archiveCompletedGame]
  );

  // Apply Clock Increment on Move
  const applyIncrement = (movedColor: PieceColor) => {
    const tc = TIME_CONTROLS.find((t) => t.key === timeControl);
    if (!tc || tc.incrementSeconds <= 0) return;

    const incMs = tc.incrementSeconds * 1000;
    if (movedColor === 'w') {
      setWhiteTimeMs((prev) => prev + incMs);
    } else {
      setBlackTimeMs((prev) => prev + incMs);
    }
  };

  // Computer Move Turn Trigger
  useEffect(() => {
    if (gameOverResult) return;
    if (activeMoveIndex !== historyRecords.length - 1) return;

    const isComputerTurn =
      (gameMode === 'vs_computer' && game.turn() !== playerColor) ||
      (gameMode === 'engine_demo' && !game.isGameOver());

    if (!isComputerTurn || isEngineThinkingRef.current) return;

    isEngineThinkingRef.current = true;
    setIsEngineThinking(true);

    let cancelled = false;
    const delay = gameMode === 'engine_demo' ? 500 : 250;

    const runEngine = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (cancelled) return;

        const currentFen = game.fen();
        const result = await calculateBestMove(currentFen, engineLevel);
        if (cancelled || !result) return;

        const gameCopy = new Chess(currentFen);
        const moveRes = gameCopy.move({
          from: result.from,
          to: result.to,
          promotion: result.promotion || 'q',
        });

        if (moveRes && !cancelled) {
          // Play procedural audio
          if (moveRes.captured) {
            sound.playCapture();
          } else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) {
            sound.playCastle();
          } else {
            sound.playMove();
          }

          if (gameCopy.inCheck()) {
            setTimeout(() => sound.playCheck(), 100);
          }

          // If clock wasn't running, start it
          if (!isClockRunning && timeControl !== 'unlimited') {
            setIsClockRunning(true);
          }

          setGame(gameCopy);
          setLastMove({ from: result.from as Square, to: result.to as Square });

          const record: MoveRecord = {
            san: moveRes.san,
            from: moveRes.from,
            to: moveRes.to,
            piece: moveRes.piece as PieceType,
            color: moveRes.color as PieceColor,
            captured: moveRes.captured as PieceType | undefined,
            fenBefore: currentFen,
            fenAfter: gameCopy.fen(),
            evalScore: result.score,
            classification: 'good',
          };

          setHistoryRecords((prev) => [...prev, record]);
          setActiveMoveIndex((prev) => prev + 1);

          applyIncrement(moveRes.color as PieceColor);
          checkGameEndStatus(gameCopy);
        }
      } catch (err) {
        console.error('Computer move error:', err);
      } finally {
        isEngineThinkingRef.current = false;
        setIsEngineThinking(false);
      }
    };

    runEngine();

    return () => {
      cancelled = true;
    };
  }, [
    game.fen(),
    gameMode,
    playerColor,
    engineLevel,
    gameOverResult,
    activeMoveIndex,
    historyRecords.length,
    isClockRunning,
    timeControl,
    checkGameEndStatus,
  ]);

  // Make Move Handler (from user interaction)
  const handleBoardMove = useCallback(
    (moveAttempt: { from: Square; to: Square; promotion?: string }): boolean => {
      if (gameOverResult || isEngineThinking) return false;

      // If viewing past move, return to current position first
      if (activeMoveIndex < historyRecords.length - 1) {
        setActiveMoveIndex(historyRecords.length - 1);
      }

      // Restrict moves if playing vs computer and it's computer's turn
      if (gameMode === 'vs_computer' && game.turn() !== playerColor) {
        return false;
      }

      const gameCopy = new Chess(game.fen());
      const fenBefore = gameCopy.fen();

      let moveResult: Move | null = null;
      try {
        moveResult = gameCopy.move({
          from: moveAttempt.from,
          to: moveAttempt.to,
          promotion: moveAttempt.promotion || (settings.autoQueenPromotion ? 'q' : undefined),
        });
      } catch {
        sound.playIllegal();
        return false;
      }

      if (!moveResult) {
        sound.playIllegal();
        return false;
      }

      // Start clock on first move
      if (!isClockRunning && timeControl !== 'unlimited') {
        setIsClockRunning(true);
      }

      // Trigger audio based on move type
      if (moveResult.captured) {
        sound.playCapture();
      } else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) {
        sound.playCastle();
      } else {
        sound.playMove();
      }

      if (gameCopy.inCheck()) {
        setTimeout(() => sound.playCheck(), 100);
      }

      setGame(gameCopy);
      setLastMove({ from: moveAttempt.from, to: moveAttempt.to });

      const record: MoveRecord = {
        san: moveResult.san,
        from: moveResult.from,
        to: moveResult.to,
        piece: moveResult.piece as PieceType,
        color: moveResult.color as PieceColor,
        captured: moveResult.captured as PieceType | undefined,
        fenBefore,
        fenAfter: gameCopy.fen(),
      };

      setHistoryRecords((prev) => [...prev, record]);
      setActiveMoveIndex((prev) => prev + 1);

      applyIncrement(moveResult.color as PieceColor);

      // Check if this move concludes the match
      const ended = checkGameEndStatus(gameCopy);
      return !ended;
    },
    [
      game,
      gameOverResult,
      isEngineThinking,
      activeMoveIndex,
      historyRecords.length,
      gameMode,
      playerColor,
      settings.autoQueenPromotion,
      isClockRunning,
      timeControl,
      checkGameEndStatus,
    ]
  );

  // Navigate move history
  const handleNavigateMove = (index: number) => {
    setActiveMoveIndex(index);
    if (index === -1) {
      // Starting position
      const initial = new Chess();
      setGame(initial);
      setLastMove(null);
    } else {
      const targetRecord = historyRecords[index];
      if (targetRecord) {
        const replay = new Chess(targetRecord.fenAfter);
        setGame(replay);
        setLastMove({
          from: targetRecord.from as Square,
          to: targetRecord.to as Square,
        });
      }
    }
  };

  // Start Fresh Game
  const handleStartConfiguredGame = (config: {
    mode: GameMode;
    timeControl: TimeControlKey;
    playerColor: 'w' | 'b' | 'random';
    engineLevel: number;
  }) => {
    const newGame = new Chess();
    setGame(newGame);
    setGameMode(config.mode);
    setTimeControl(config.timeControl);
    const chosenSide = config.playerColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : config.playerColor;
    setPlayerColor(chosenSide);
    setEngineLevel(config.engineLevel);

    setLastMove(null);
    setHistoryRecords([]);
    setActiveMoveIndex(-1);
    setGameOverResult(null);
    setDrawOfferPending(false);

    // Reset clocks
    const tc = TIME_CONTROLS.find((t) => t.key === config.timeControl) || TIME_CONTROLS[6];
    const ms = tc.initialSeconds * 1000;
    setWhiteTimeMs(ms);
    setBlackTimeMs(ms);
    setIsClockRunning(false);
    isEngineThinkingRef.current = false;
    setIsEngineThinking(false);

    setCurrentTab('play');
    storage.saveActiveGame(null);
  };

  // Resignation
  const handleResign = () => {
    if (gameOverResult) return;
    const resigningColor = game.turn();
    const winnerColor = resigningColor === 'w' ? 'Black' : 'White';
    const code = resigningColor === 'w' ? '0-1' : '1-0';
    sound.playGameOver();

    const finish = {
      title: `${winnerColor} Won by Resignation`,
      description: `${resigningColor === 'w' ? 'White' : 'Black'} has resigned the match.`,
      resultCode: code,
    };
    setGameOverResult(finish);
    archiveCompletedGame(code);
    setIsClockRunning(false);
  };

  // Offer Draw
  const handleDrawOffer = () => {
    if (gameOverResult) return;
    if (gameMode === 'vs_computer') {
      // In vs_computer, engine evaluates if position is drawn (-50 to +50 centipawns)
      evaluatePosition(game.fen(), 3).then((res) => {
        if (Math.abs(res.score) < 70) {
          sound.playGameOver();
          setGameOverResult({
            title: 'Draw Agreed',
            description: 'The computer accepted your draw offer based on equal material and dynamic balance.',
            resultCode: '1/2-1/2',
          });
          archiveCompletedGame('1/2-1/2');
          setIsClockRunning(false);
        } else {
          setDrawOfferPending(true);
          setTimeout(() => setDrawOfferPending(false), 2500);
        }
      });
    } else {
      // 2 player draw agreement
      sound.playGameOver();
      setGameOverResult({
        title: 'Draw Agreed',
        description: 'Both players mutually agreed to conclude the match in a draw.',
        resultCode: '1/2-1/2',
      });
      archiveCompletedGame('1/2-1/2');
      setIsClockRunning(false);
    }
  };

  // Takeback / Undo
  const handleUndoMove = () => {
    if (historyRecords.length === 0 || gameOverResult) return;
    isEngineThinkingRef.current = false;
    setIsEngineThinking(false);

    const gameCopy = new Chess(game.fen());
    if (gameMode === 'vs_computer') {
      // Undo both player and computer moves
      gameCopy.undo();
      gameCopy.undo();
      const newHistory = historyRecords.slice(0, -2);
      setHistoryRecords(newHistory);
      setActiveMoveIndex(newHistory.length - 1);
    } else {
      gameCopy.undo();
      const newHistory = historyRecords.slice(0, -1);
      setHistoryRecords(newHistory);
      setActiveMoveIndex(newHistory.length - 1);
    }
    setGame(gameCopy);
    setLastMove(null);
  };

  // Play opening from explorer
  const handleSelectOpeningToPlay = (opening: OpeningVariation) => {
    isEngineThinkingRef.current = false;
    setIsEngineThinking(false);
    const fresh = new Chess(opening.fen);
    setGame(fresh);
    setGameMode('vs_computer');
    setPlayerColor('w');
    setLastMove(null);
    setHistoryRecords([]);
    setActiveMoveIndex(-1);
    setGameOverResult(null);
    setCurrentTab('play');
  };

  // Replay finished game from archive
  const handleReplayArchivedGame = (saved: SavedGame) => {
    try {
      const g = new Chess();
      g.loadPgn(saved.pgn);
      const moves = g.history({ verbose: true });

      const replayHistory: MoveRecord[] = [];
      const stepper = new Chess();

      for (const m of moves) {
        const fenBefore = stepper.fen();
        stepper.move(m);
        replayHistory.push({
          san: m.san,
          from: m.from,
          to: m.to,
          piece: m.piece as PieceType,
          color: m.color as PieceColor,
          captured: m.captured as PieceType | undefined,
          fenBefore,
          fenAfter: stepper.fen(),
        });
      }

      setGame(stepper);
      setHistoryRecords(replayHistory);
      setActiveMoveIndex(replayHistory.length - 1);
      setGameMode('pgn_replay');
      setGameOverResult({
        title: `Game Concluded (${saved.result})`,
        description: `${saved.white} vs ${saved.black} (${saved.date})`,
        resultCode: saved.result,
      });
      setCurrentTab('play');
    } catch {
      // ignore
    }
  };

  // Load custom FEN or PGN
  const handleLoadCustomFEN = (fen: string) => {
    const custom = new Chess(fen);
    setGame(custom);
    setLastMove(null);
    setHistoryRecords([]);
    setActiveMoveIndex(-1);
    setGameOverResult(null);
    setCurrentTab('play');
  };

  const handleLoadCustomPGN = (pgn: string) => {
    const custom = new Chess();
    custom.loadPgn(pgn);
    setGame(custom);
    setLastMove(null);
    setHistoryRecords([]);
    setActiveMoveIndex(-1);
    setGameOverResult(null);
    setCurrentTab('play');
  };

  // Export PGN download
  const handleExportPGN = () => {
    const pgn = game.pgn() || `[Date "${new Date().toISOString()}"]\n1. e4 e5`;
    navigator.clipboard.writeText(pgn);
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grandmaster-game-${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Universal Top Navigation Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCrossPlatform={() => setIsCrossPlatformOpen(true)}
        onNewGame={() => setIsNewGameModalOpen(true)}
      />

      {/* 2. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {/* TAB 1: Play Board */}
        {currentTab === 'play' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: The Chessboard & Clocks Column */}
            <div className="lg:col-span-8 flex flex-col items-center space-y-2.5">
              {/* Top Player Strip (Opponent / Black or White if flipped) */}
              <div className="w-full max-w-[min(82vw,620px)]">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <CapturedPieces
                    color={boardFlipped ? 'w' : 'b'}
                    capturedPieces={boardFlipped ? whiteCaptured : blackCaptured}
                    materialAdvantage={
                      boardFlipped ? materialAdvantage.white : materialAdvantage.black
                    }
                    pieceTheme={settings.pieceTheme}
                  />
                  {isEngineThinking && (
                    <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5 animate-pulse">
                      <Bot className="w-3.5 h-3.5" />
                      Engine calculating...
                    </span>
                  )}
                </div>

                <Clock
                  color={boardFlipped ? 'w' : 'b'}
                  timeRemainingMs={boardFlipped ? whiteTimeMs : blackTimeMs}
                  isActive={isClockRunning && game.turn() === (boardFlipped ? 'w' : 'b')}
                  isUnlimited={timeControl === 'unlimited'}
                  playerName={
                    gameMode === 'vs_computer'
                      ? boardFlipped
                        ? 'Player (White)'
                        : `Stockfish Bot (Level ${engineLevel})`
                      : boardFlipped
                      ? 'Player 1 (White)'
                      : 'Player 2 (Black)'
                  }
                  rating={
                    gameMode === 'vs_computer' && !boardFlipped
                      ? ENGINE_LEVELS[engineLevel - 1]?.elo
                      : undefined
                  }
                  avatarIcon={
                    gameMode === 'vs_computer' && !boardFlipped ? (
                      <Bot className="w-4 h-4 text-amber-400" />
                    ) : (
                      <User className="w-4 h-4 text-slate-400" />
                    )
                  }
                />
              </div>

              {/* The Chessboard */}
              <Chessboard
                game={game}
                onMove={handleBoardMove}
                flipped={boardFlipped}
                boardTheme={settings.boardTheme}
                pieceTheme={settings.pieceTheme}
                showCoordinates={settings.showCoordinates}
                showLegalMoves={settings.showLegalMoves}
                lastMove={lastMove}
                interactive={
                  !gameOverResult &&
                  (gameMode !== 'vs_computer' || game.turn() === playerColor) &&
                  gameMode !== 'engine_demo'
                }
              />

              {/* Bottom Player Strip (User / White or Black if flipped) */}
              <div className="w-full max-w-[min(82vw,620px)] space-y-1.5">
                <Clock
                  color={boardFlipped ? 'b' : 'w'}
                  timeRemainingMs={boardFlipped ? blackTimeMs : whiteTimeMs}
                  isActive={isClockRunning && game.turn() === (boardFlipped ? 'b' : 'w')}
                  isUnlimited={timeControl === 'unlimited'}
                  playerName={
                    gameMode === 'vs_computer'
                      ? boardFlipped
                        ? `Stockfish Bot (Level ${engineLevel})`
                        : 'Player (White)'
                      : boardFlipped
                      ? 'Player 2 (Black)'
                      : 'Player 1 (White)'
                  }
                  rating={
                    gameMode === 'vs_computer' && boardFlipped
                      ? ENGINE_LEVELS[engineLevel - 1]?.elo
                      : undefined
                  }
                  avatarIcon={
                    gameMode === 'vs_computer' && boardFlipped ? (
                      <Bot className="w-4 h-4 text-amber-400" />
                    ) : (
                      <User className="w-4 h-4 text-slate-400" />
                    )
                  }
                />

                <div className="flex items-center justify-between px-0.5">
                  <CapturedPieces
                    color={boardFlipped ? 'b' : 'w'}
                    capturedPieces={boardFlipped ? blackCaptured : whiteCaptured}
                    materialAdvantage={
                      boardFlipped ? materialAdvantage.black : materialAdvantage.white
                    }
                    pieceTheme={settings.pieceTheme}
                  />

                  {/* Mid-Game Action Bar */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBoardFlipped(!boardFlipped)}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                      title="Flip Board Orientation"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleUndoMove}
                      disabled={historyRecords.length === 0 || !!gameOverResult}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Undo Takeback"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDrawOffer}
                      disabled={!!gameOverResult}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Offer Draw"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleResign}
                      disabled={!!gameOverResult}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Resign Match"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {drawOfferPending && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-300 animate-fade-in">
                    Draw declined by computer. Play continues!
                  </div>
                )}
              </div>
            </div>

            {/* Right: Notation & Live Engine Review Column */}
            <div className="lg:col-span-4 space-y-4">
              {/* Move History Table */}
              <MoveHistory
                history={historyRecords}
                currentMoveIndex={activeMoveIndex}
                onNavigateMove={handleNavigateMove}
                onExportPGN={handleExportPGN}
                onImportPGN={() => setIsCustomPosModalOpen(true)}
                fen={game.fen()}
              />

              {/* Live Engine Analysis Widget */}
              <AnalysisPanel
                fen={game.fen()}
                history={historyRecords}
                activeMoveIndex={activeMoveIndex}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Analysis Room */}
        {currentTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-[min(82vw,560px)]">
                <Chessboard
                  game={game}
                  onMove={handleBoardMove}
                  flipped={boardFlipped}
                  boardTheme={settings.boardTheme}
                  pieceTheme={settings.pieceTheme}
                  showCoordinates={settings.showCoordinates}
                  showLegalMoves={settings.showLegalMoves}
                  lastMove={lastMove}
                  interactive={true}
                />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <AnalysisPanel
                fen={game.fen()}
                history={historyRecords}
                activeMoveIndex={activeMoveIndex}
              />
              <MoveHistory
                history={historyRecords}
                currentMoveIndex={activeMoveIndex}
                onNavigateMove={handleNavigateMove}
                onExportPGN={handleExportPGN}
                onImportPGN={() => setIsCustomPosModalOpen(true)}
                fen={game.fen()}
              />
            </div>
          </div>
        )}

        {/* TAB 3: Tactical Puzzles */}
        {currentTab === 'puzzles' && (
          <PuzzleTrainer
            boardTheme={settings.boardTheme}
            pieceTheme={settings.pieceTheme}
            showCoordinates={settings.showCoordinates}
            showLegalMoves={settings.showLegalMoves}
          />
        )}

        {/* TAB 4: Opening Explorer */}
        {currentTab === 'openings' && (
          <OpeningExplorer onSelectOpeningToPlay={handleSelectOpeningToPlay} />
        )}

        {/* TAB 5: Master Lessons */}
        {currentTab === 'academy' && (
          <LessonsView
            boardTheme={settings.boardTheme}
            pieceTheme={settings.pieceTheme}
          />
        )}

        {/* TAB 6: Archive / Match History */}
        {currentTab === 'history' && (
          <GameHistoryView onReplayGame={handleReplayArchivedGame} />
        )}
      </main>

      {/* 3. Game Over Modal Overlay */}
      {gameOverResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-xl font-bold font-serif">
              ♔
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                Result {gameOverResult.resultCode}
              </span>
              <h3 className="text-lg font-bold text-white">{gameOverResult.title}</h3>
              <p className="text-xs text-slate-300 mt-1">{gameOverResult.description}</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setGameOverResult(null);
                  setIsNewGameModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Play New Match
              </button>
              <button
                onClick={() => setGameOverResult(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Review Board Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Settings Drawer / Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newS) => {
          setSettings(newS);
          storage.saveSettings(newS);
        }}
      />

      {/* 5. New Game Configuration Modal */}
      <NewGameModal
        isOpen={isNewGameModalOpen}
        onClose={() => setIsNewGameModalOpen(false)}
        onStartGame={handleStartConfiguredGame}
        defaultEngineLevel={engineLevel}
      />

      {/* 6. Custom Position & PGN Import Dialog */}
      <CustomPositionDialog
        isOpen={isCustomPosModalOpen}
        onClose={() => setIsCustomPosModalOpen(false)}
        onLoadFEN={handleLoadCustomFEN}
        onLoadPGN={handleLoadCustomPGN}
        currentFEN={game.fen()}
      />

      {/* 7. Cross-Platform Packaging Modal */}
      <CrossPlatformModal
        isOpen={isCrossPlatformOpen}
        onClose={() => setIsCrossPlatformOpen(false)}
      />

      {/* 8. PWA Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
