import React, { useState } from 'react';
import { X, Bot, Users, Play, Clock, Sparkles } from 'lucide-react';
import { GameMode, TimeControlKey, TimeControlConfig } from '../types/chess';
import { ENGINE_LEVELS } from '../engine/engine';

export const TIME_CONTROLS: TimeControlConfig[] = [
  { key: 'unlimited', label: 'Unlimited', category: 'Untimed', initialSeconds: 0, incrementSeconds: 0 },
  { key: '1+0', label: '1 min', category: 'Bullet', initialSeconds: 60, incrementSeconds: 0 },
  { key: '2+1', label: '2 | 1', category: 'Bullet', initialSeconds: 120, incrementSeconds: 1 },
  { key: '3+0', label: '3 min', category: 'Blitz', initialSeconds: 180, incrementSeconds: 0 },
  { key: '3+2', label: '3 | 2', category: 'Blitz', initialSeconds: 180, incrementSeconds: 2 },
  { key: '5+0', label: '5 min', category: 'Blitz', initialSeconds: 300, incrementSeconds: 0 },
  { key: '5+3', label: '5 | 3', category: 'Blitz', initialSeconds: 300, incrementSeconds: 3 },
  { key: '10+0', label: '10 min', category: 'Rapid', initialSeconds: 600, incrementSeconds: 0 },
  { key: '10+5', label: '10 | 5', category: 'Rapid', initialSeconds: 600, incrementSeconds: 5 },
  { key: '15+10', label: '15 | 10', category: 'Rapid', initialSeconds: 900, incrementSeconds: 10 },
  { key: '30+0', label: '30 min', category: 'Classical', initialSeconds: 1800, incrementSeconds: 0 },
];

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    mode: GameMode;
    timeControl: TimeControlKey;
    playerColor: 'w' | 'b' | 'random';
    engineLevel: number;
  }) => void;
  defaultEngineLevel: number;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  defaultEngineLevel,
}) => {
  const [mode, setMode] = useState<GameMode>('vs_computer');
  const [timeControl, setTimeControl] = useState<TimeControlKey>('5+3');
  const [side, setSide] = useState<'w' | 'b' | 'random'>('w');
  const [engineLevel, setEngineLevel] = useState(defaultEngineLevel);

  if (!isOpen) return null;

  const handleStart = () => {
    let resolvedSide = side;
    if (resolvedSide === 'random') {
      resolvedSide = Math.random() < 0.5 ? 'w' : 'b';
    }
    onStartGame({
      mode,
      timeControl,
      playerColor: resolvedSide,
      engineLevel,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Configure New Game
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Opponent & Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMode('vs_computer')}
              className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'vs_computer'
                  ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span className="text-xs text-center">vs Computer</span>
            </button>

            <button
              onClick={() => setMode('pass_and_play')}
              className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'pass_and_play'
                  ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs text-center">Pass & Play</span>
            </button>

            <button
              onClick={() => setMode('engine_demo')}
              className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'engine_demo'
                  ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs text-center">Bot vs Bot</span>
            </button>
          </div>
        </div>

        {/* Engine Strength Selector (if vs_computer) */}
        {mode === 'vs_computer' && (
          <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Computer Level:</span>
              <span className="font-mono text-amber-400 font-bold">
                {ENGINE_LEVELS[engineLevel - 1]?.name} (~{ENGINE_LEVELS[engineLevel - 1]?.elo} Elo)
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={engineLevel}
              onChange={(e) => setEngineLevel(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        )}

        {/* Side Selection */}
        {mode === 'vs_computer' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Play As
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSide('w')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  side === 'w'
                    ? 'border-amber-400 bg-amber-500/15 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300" />
                <span>White</span>
              </button>
              <button
                onClick={() => setSide('random')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  side === 'random'
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <span className="font-bold text-amber-400">?</span>
                <span>Random</span>
              </button>
              <button
                onClick={() => setSide('b')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  side === 'b'
                    ? 'border-amber-400 bg-amber-500/15 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-700" />
                <span>Black</span>
              </button>
            </div>
          </div>
        )}

        {/* Time Control Options */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Time Control
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {TIME_CONTROLS.map((tc) => {
              const isSelected = timeControl === tc.key;
              return (
                <button
                  key={tc.key}
                  onClick={() => setTimeControl(tc.key)}
                  className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-mono">{tc.label}</div>
                  <div className="text-[10px] text-slate-500">{tc.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
