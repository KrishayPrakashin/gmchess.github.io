import React, { useState } from 'react';
import { SavedGame } from '../types/chess';
import { storage } from '../storage/db';
import { History, Play, Trash2, Download, Trophy, Clock } from 'lucide-react';

interface GameHistoryViewProps {
  onReplayGame: (game: SavedGame) => void;
}

export const GameHistoryView: React.FC<GameHistoryViewProps> = ({ onReplayGame }) => {
  const [games, setGames] = useState<SavedGame[]>(() => storage.getCompletedGames());

  const handleClear = () => {
    storage.clearCompletedGames();
    setGames([]);
  };

  const handleExport = (game: SavedGame) => {
    const blob = new Blob([game.pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-game-${game.id}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">Match History & Archive</h3>
            <p className="text-xs text-slate-400">Offline stored games available for review and engine replay</p>
          </div>
        </div>
        {games.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Game Cards */}
      {games.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs space-y-2">
          <History className="w-8 h-8 mx-auto opacity-30" />
          <p>No completed games yet.</p>
          <p className="text-[11px] text-slate-600">Finish a match against the computer or in local pass & play to archive it here.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
          {games.map((g) => (
            <div
              key={g.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-xs">
                    {g.white} (W) vs {g.black} (B)
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                    {g.result}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>{g.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {g.timeControl}
                  </span>
                  <span>·</span>
                  <span>{g.moves.length} moves</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport(g)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Download PGN"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onReplayGame(g)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Replay</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
