import React, { useRef, useEffect } from 'react';
import {
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  Copy,
  Download,
  Upload,
  Check,
} from 'lucide-react';
import { MoveRecord } from '../types/chess';

interface MoveHistoryProps {
  history: MoveRecord[];
  currentMoveIndex: number; // -1 for starting position, 0 for move 1 white, etc.
  onNavigateMove: (index: number) => void;
  onExportPGN: () => void;
  onImportPGN: () => void;
  fen: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex,
  onNavigateMove,
  onExportPGN,
  onImportPGN,
  fen,
}) => {
  const [copiedFEN, setCopiedFEN] = React.useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs (White & Black)
  const movePairs: { moveNumber: number; white?: MoveRecord; black?: MoveRecord; whiteIdx: number; blackIdx: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
      whiteIdx: i,
      blackIdx: i + 1,
    });
  }

  // Auto-scroll to current move
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [currentMoveIndex, history.length]);

  const copyFENToClipboard = () => {
    navigator.clipboard.writeText(fen);
    setCopiedFEN(true);
    setTimeout(() => setCopiedFEN(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header with Title and PGN / FEN tools */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/60">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Notation (SAN)
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyFENToClipboard}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer"
            title="Copy FEN to clipboard"
          >
            {copiedFEN ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onExportPGN}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer"
            title="Export PGN"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onImportPGN}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer"
            title="Import PGN"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Move List Table */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-2 py-1.5 font-mono text-xs space-y-0.5 divide-y divide-slate-800/40 min-h-[140px] max-h-[220px] lg:max-h-[300px]"
      >
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs italic py-8">
            Game awaiting first move
          </div>
        ) : (
          movePairs.map((pair) => {
            const isWhiteActive = currentMoveIndex === pair.whiteIdx;
            const isBlackActive = currentMoveIndex === pair.blackIdx;

            return (
              <div
                key={pair.moveNumber}
                className="grid grid-cols-[38px_1fr_1fr] items-center py-1 px-1.5 hover:bg-slate-800/40 rounded transition-colors"
              >
                <span className="text-slate-500 select-none text-[11px] font-bold">
                  {pair.moveNumber}.
                </span>
                {pair.white ? (
                  <button
                    onClick={() => onNavigateMove(pair.whiteIdx)}
                    data-active={isWhiteActive}
                    className={`text-left px-2 py-0.5 rounded transition cursor-pointer truncate ${
                      isWhiteActive
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {pair.white.san}
                  </button>
                ) : (
                  <span />
                )}
                {pair.black ? (
                  <button
                    onClick={() => onNavigateMove(pair.blackIdx)}
                    data-active={isBlackActive}
                    className={`text-left px-2 py-0.5 rounded transition cursor-pointer truncate ${
                      isBlackActive
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {pair.black.san}
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-2 border-t border-slate-800 bg-slate-950/60">
        <button
          onClick={() => onNavigateMove(-1)}
          disabled={currentMoveIndex === -1}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          title="Start of game"
        >
          <ChevronFirst className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigateMove(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex === -1}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          title="Previous move"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-slate-400">
          {currentMoveIndex === -1
            ? 'Start'
            : `Move ${Math.floor(currentMoveIndex / 2) + 1} (${currentMoveIndex % 2 === 0 ? 'W' : 'B'})`}
        </span>
        <button
          onClick={() => onNavigateMove(Math.min(history.length - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= history.length - 1}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          title="Next move"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigateMove(history.length - 1)}
          disabled={currentMoveIndex >= history.length - 1}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          title="Current position"
        >
          <ChevronLast className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
