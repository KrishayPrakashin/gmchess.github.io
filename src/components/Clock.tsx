import React from 'react';
import { Timer, AlertCircle } from 'lucide-react';
import { PieceColor } from '../types/chess';

interface ClockProps {
  color: PieceColor;
  timeRemainingMs: number;
  isActive: boolean;
  playerName: string;
  isUnlimited?: boolean;
  avatarIcon?: React.ReactNode;
  rating?: number;
}

export const Clock: React.FC<ClockProps> = ({
  color,
  timeRemainingMs,
  isActive,
  playerName,
  isUnlimited = false,
  avatarIcon,
  rating,
}) => {
  if (isUnlimited) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          {avatarIcon}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">{playerName}</span>
            {rating && <span className="text-[10px] text-slate-500 font-mono">Elo {rating}</span>}
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Untimed</span>
      </div>
    );
  }

  const totalSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((Math.max(0, timeRemainingMs) % 1000) / 100);

  const isLowTime = totalSeconds < 30;
  const isCritical = totalSeconds < 10;

  // Format mm:ss or ss.tenths when under 10 seconds
  const formattedTime =
    totalSeconds < 10
      ? `${seconds}.${tenths}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isFlagFallen = timeRemainingMs <= 0;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
        isActive
          ? 'bg-amber-500/10 border-2 border-amber-500/50 shadow-md shadow-amber-500/10'
          : 'bg-slate-900/70 border border-slate-800'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-3.5 h-3.5 rounded-full border ${
            color === 'w' ? 'bg-white border-slate-400' : 'bg-slate-950 border-slate-600'
          }`}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-200">{playerName}</span>
            {rating && (
              <span className="text-[10px] text-amber-400/90 font-mono font-medium">
                {rating}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isFlagFallen ? (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 text-white font-mono text-xs font-bold animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>0:00 (Timeout)</span>
          </div>
        ) : (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono font-bold tracking-wider tabular-nums text-sm transition-colors ${
              isActive
                ? isCritical
                  ? 'bg-rose-500 text-white animate-pulse'
                  : isLowTime
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-amber-300'
                : 'bg-slate-800/80 text-slate-300'
            }`}
          >
            <Timer className="w-3.5 h-3.5 opacity-70" />
            <span>{formattedTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};
