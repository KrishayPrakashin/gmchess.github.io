import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Award, AlertTriangle, XCircle, Info } from 'lucide-react';
import { evaluatePosition } from '../engine/engine';
import { MoveRecord } from '../types/chess';

interface AnalysisPanelProps {
  fen: string;
  history: MoveRecord[];
  activeMoveIndex: number;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  fen,
  history,
  activeMoveIndex,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [evalResult, setEvalResult] = useState<{
    score: number;
    evalText: string;
    bestMove?: string;
  } | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (!isAnalyzing) return;

    let isMounted = true;
    setEvaluating(true);

    evaluatePosition(fen, 4).then((res) => {
      if (isMounted) {
        setEvalResult(res);
        setEvaluating(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fen, isAnalyzing]);

  // Count move qualities
  const qualities = history.reduce(
    (acc, m) => {
      if (m.classification) {
        acc[m.classification] = (acc[m.classification] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Compute evaluation bar height/percentage (White advantage = positive)
  const score = evalResult ? evalResult.score : 0;
  // Clamp between -800 and +800 for visual bar
  const clampedScore = Math.max(-800, Math.min(800, score));
  // White percentage: 50% at 0 score, 100% at +800, 0% at -800
  const whitePercent = 50 + (clampedScore / 800) * 45;

  const currentMove = activeMoveIndex >= 0 ? history[activeMoveIndex] : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg space-y-3.5 text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            Engine Analysis Room
          </span>
        </div>
        <button
          onClick={() => setIsAnalyzing(!isAnalyzing)}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
            isAnalyzing
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isAnalyzing ? 'Active' : 'Paused'}
        </button>
      </div>

      {/* Evaluation Meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            Evaluation
          </span>
          <span className="font-bold text-amber-300 tabular-nums">
            {evaluating ? 'Thinking...' : evalResult ? evalResult.evalText : '0.00'}
          </span>
        </div>

        {/* Dual Color Evaluation Bar */}
        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-700/60 shadow-inner">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${whitePercent}%` }}
          />
          <div
            className="h-full bg-slate-900 transition-all duration-300 ease-out"
            style={{ width: `${100 - whitePercent}%` }}
          />
        </div>
      </div>

      {/* Suggested Best Move */}
      {evalResult?.bestMove && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Recommended Engine Move:
          </span>
          <span className="font-mono font-bold text-emerald-400 text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {evalResult.bestMove}
          </span>
        </div>
      )}

      {/* Current Move Assessment */}
      {currentMove && (
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-300 font-bold">{currentMove.san}</span>
            <span className="text-slate-400 text-[11px]">
              by {currentMove.color === 'w' ? 'White' : 'Black'}
            </span>
          </div>
          {currentMove.classification && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentMove.classification === 'best'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : currentMove.classification === 'good'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : currentMove.classification === 'inaccuracy'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {currentMove.classification}
            </span>
          )}
        </div>
      )}

      {/* Game Quality Breakdown Badges */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/70 text-center font-mono">
        <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/80">
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400">
            <Award className="w-3 h-3" /> Best
          </div>
          <span className="font-bold text-slate-200 text-xs tabular-nums">
            {qualities.best || 0}
          </span>
        </div>
        <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/80">
          <div className="flex items-center justify-center gap-1 text-[10px] text-blue-400">
            <Info className="w-3 h-3" /> Good
          </div>
          <span className="font-bold text-slate-200 text-xs tabular-nums">
            {qualities.good || 0}
          </span>
        </div>
        <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/80">
          <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400">
            <AlertTriangle className="w-3 h-3" /> Inacc.
          </div>
          <span className="font-bold text-slate-200 text-xs tabular-nums">
            {qualities.inaccuracy || 0}
          </span>
        </div>
        <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/80">
          <div className="flex items-center justify-center gap-1 text-[10px] text-rose-400">
            <XCircle className="w-3 h-3" /> Blunder
          </div>
          <span className="font-bold text-slate-200 text-xs tabular-nums">
            {(qualities.mistake || 0) + (qualities.blunder || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
