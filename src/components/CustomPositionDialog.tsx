import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { X, Check, AlertCircle, Play, RotateCcw } from 'lucide-react';

interface CustomPositionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadFEN: (fen: string) => void;
  onLoadPGN: (pgn: string) => void;
  currentFEN: string;
}

export const CustomPositionDialog: React.FC<CustomPositionDialogProps> = ({
  isOpen,
  onClose,
  onLoadFEN,
  onLoadPGN,
  currentFEN,
}) => {
  const [activeTab, setActiveTab] = useState<'fen' | 'pgn'>('fen');
  const [fenInput, setFenInput] = useState(currentFEN);
  const [pgnInput, setPgnInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyFEN = () => {
    try {
      const trimmed = fenInput.trim();
      const test = new Chess(trimmed);
      if (test.fen()) {
        onLoadFEN(trimmed);
        setError(null);
        onClose();
      }
    } catch {
      setError('Invalid FEN position string. Please verify chess piece syntax.');
    }
  };

  const handleApplyPGN = () => {
    try {
      const trimmed = pgnInput.trim();
      const test = new Chess();
      test.loadPgn(trimmed);
      onLoadPGN(trimmed);
      setError(null);
      onClose();
    } catch {
      setError('Invalid PGN notation. Please verify move syntax.');
    }
  };

  const setStartingPosition = () => {
    setFenInput('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setError(null);
  };

  const setBlankPosition = () => {
    setFenInput('8/8/8/8/8/8/8/8 w - - 0 1');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Import / Custom Board Position
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => {
              setActiveTab('fen');
              setError(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'fen'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            FEN String
          </button>
          <button
            onClick={() => {
              setActiveTab('pgn');
              setError(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'pgn'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PGN Game Text
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FEN Body */}
        {activeTab === 'fen' ? (
          <div className="space-y-3">
            <label className="block text-xs text-slate-300 font-medium">
              Forsyth-Edwards Notation (FEN):
            </label>
            <textarea
              value={fenInput}
              onChange={(e) => {
                setFenInput(e.target.value);
                setError(null);
              }}
              rows={3}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              placeholder="e.g. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={setStartingPosition}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
              >
                Standard Initial Position
              </button>
              <button
                type="button"
                onClick={setBlankPosition}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
              >
                Empty Board
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs text-slate-300 font-medium">
              Portable Game Notation (PGN):
            </label>
            <textarea
              value={pgnInput}
              onChange={(e) => {
                setPgnInput(e.target.value);
                setError(null);
              }}
              rows={6}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              placeholder={'[Event "World Championship"]\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6...'}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={activeTab === 'fen' ? handleApplyFEN : handleApplyPGN}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Load & Play Position
          </button>
        </div>
      </div>
    </div>
  );
};
