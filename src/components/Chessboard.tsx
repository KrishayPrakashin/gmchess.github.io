import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { ChessPiece } from '../chess/pieces';
import { BoardThemeId, PieceThemeId, PieceColor, PieceType } from '../types/chess';
import { BOARD_THEMES } from '../chess/themes';
import { sound } from '../chess/sound';

interface ChessboardProps {
  game: Chess;
  onMove: (move: { from: Square; to: Square; promotion?: string }) => boolean;
  flipped?: boolean;
  boardTheme?: BoardThemeId;
  pieceTheme?: PieceThemeId;
  showCoordinates?: boolean;
  showLegalMoves?: boolean;
  bestMoveArrow?: { from: string; to: string } | null;
  interactive?: boolean;
  lastMove?: { from: Square; to: Square } | null;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  game,
  onMove,
  flipped = false,
  boardTheme = 'tournament',
  pieceTheme = 'classic',
  showCoordinates = true,
  showLegalMoves = true,
  bestMoveArrow = null,
  interactive = true,
  lastMove = null,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [promotionPending, setPromotionPending] = useState<{ from: Square; to: Square } | null>(null);
  const [draggingSquare, setDraggingSquare] = useState<Square | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const activeTheme = BOARD_THEMES[boardTheme] || BOARD_THEMES.tournament;

  // Clear selections if board or interactive changes
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
    setPromotionPending(null);
  }, [game.fen(), interactive]);

  // Determine checked King square
  const inCheck = game.inCheck();
  let checkedKingSquare: Square | null = null;
  if (inCheck) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const file = String.fromCharCode(97 + c);
          const rank = 8 - r;
          checkedKingSquare = `${file}${rank}` as Square;
          break;
        }
      }
      if (checkedKingSquare) break;
    }
  }

  // Handle Square Selection / Move Target
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!interactive || promotionPending) return;

      if (!selectedSquare) {
        // Select piece if it's the current player's piece
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          const moves = game.moves({ square, verbose: true });
          setLegalMoves(moves);
        }
        return;
      }

      // Check if clicked square is the same -> deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Check if clicking another piece of the same color -> re-select
      const clickedPiece = game.get(square);
      if (clickedPiece && clickedPiece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves);
        return;
      }

      // Check if legal move
      const targetMove = legalMoves.find((m) => m.to === square);
      if (targetMove) {
        // Check for promotion
        const movingPiece = game.get(selectedSquare);
        const isPromotion =
          movingPiece?.type === 'p' &&
          ((movingPiece.color === 'w' && square[1] === '8') ||
            (movingPiece.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          setPromotionPending({ from: selectedSquare, to: square });
          return;
        }

        // Execute regular move
        const success = onMove({ from: selectedSquare, to: square });
        if (success) {
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      } else {
        // Deselect or play illegal feedback
        sound.playIllegal();
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [game, interactive, legalMoves, onMove, promotionPending, selectedSquare]
  );

  // Complete Promotion
  const handlePromotionSelect = (pieceType: PieceType) => {
    if (!promotionPending) return;
    const { from, to } = promotionPending;
    onMove({ from, to, promotion: pieceType });
    setPromotionPending(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  // Drag and Drop support
  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (!interactive || promotionPending) return;
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) {
      e.preventDefault();
      return;
    }
    setDraggingSquare(square);
    setSelectedSquare(square);
    setLegalMoves(game.moves({ square, verbose: true }));
    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    if (!draggingSquare) return;
    handleSquareClick(targetSquare);
    setDraggingSquare(null);
  };

  // Rank and File generation based on flipped perspective
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="relative w-full aspect-square max-w-[min(82vw,620px)] mx-auto select-none">
      {/* Board Shell Container */}
      <div
        ref={boardRef}
        className={`w-full h-full grid grid-cols-8 grid-rows-8 border-4 ${activeTheme.borderClass} rounded-lg shadow-2xl overflow-hidden relative touch-manipulation`}
      >
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const square = `${file}${rank}` as Square;
            const piece = game.get(square);
            const isLight = (rankIdx + fileIdx) % 2 === 0;

            const isSelected = selectedSquare === square;
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isCheckedKing = checkedKingSquare === square;

            const legalMove = legalMoves.find((m) => m.to === square);
            const isLegalTarget = Boolean(legalMove);
            const isCaptureTarget = isLegalTarget && (Boolean(piece) || legalMove?.flags.includes('e'));

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-75 ${
                  isLight ? activeTheme.lightSquare : activeTheme.darkSquare
                } ${isSelected ? activeTheme.selectedSquare : ''} ${
                  isLastMove && !isSelected ? activeTheme.lastMoveSquare : ''
                } ${isCheckedKing ? 'ring-4 ring-rose-600 bg-rose-500/40 animate-pulse' : ''}`}
                data-square={square}
              >
                {/* Coordinates inside corners */}
                {showCoordinates && (
                  <>
                    {/* Rank number on left-most column */}
                    {fileIdx === 0 && (
                      <span
                        className={`absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-bold font-mono pointer-events-none select-none ${
                          isLight ? 'text-black/50' : 'text-white/60'
                        }`}
                      >
                        {rank}
                      </span>
                    )}
                    {/* File letter on bottom-most row */}
                    {rankIdx === 7 && (
                      <span
                        className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-bold font-mono pointer-events-none select-none ${
                          isLight ? 'text-black/50' : 'text-white/60'
                        }`}
                      >
                        {file}
                      </span>
                    )}
                  </>
                )}

                {/* Legal Move Indicators */}
                {showLegalMoves && isLegalTarget && !isCaptureTarget && (
                  <div className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/25 pointer-events-none z-10 animate-fade-in" />
                )}
                {showLegalMoves && isCaptureTarget && (
                  <div className="absolute inset-1 rounded-full border-4 border-black/25 pointer-events-none z-10 animate-fade-in" />
                )}

                {/* Piece Image */}
                {piece && (
                  <div
                    draggable={interactive && piece.color === game.turn()}
                    onDragStart={(e) => handleDragStart(e, square)}
                    className="w-[86%] h-[86%] flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                  >
                    <ChessPiece
                      type={piece.type}
                      color={piece.color}
                      theme={pieceTheme}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Promotion Choice Modal */}
      {promotionPending && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 rounded-lg">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl max-w-xs text-center animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3">
              Promote Pawn
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map((pType) => (
                <button
                  key={pType}
                  onClick={() => handlePromotionSelect(pType)}
                  className="aspect-square bg-slate-800 hover:bg-amber-500/20 hover:border-amber-400 border border-slate-700 rounded-lg p-2 flex items-center justify-center transition-all cursor-pointer group"
                  title={`Promote to ${pType.toUpperCase()}`}
                >
                  <div className="w-10 h-10 group-hover:scale-110 transition-transform">
                    <ChessPiece
                      type={pType}
                      color={game.turn()}
                      theme={pieceTheme}
                    />
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setPromotionPending(null);
                setSelectedSquare(null);
                setLegalMoves([]);
              }}
              className="mt-4 text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Cancel Move
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
