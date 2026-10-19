import React, { useState } from 'react';
import { MASTER_OPENINGS } from '../chess/openings';
import { OpeningVariation } from '../types/chess';
import { BookOpen, Star, Play, ChevronRight, Check } from 'lucide-react';
import { storage } from '../storage/db';

interface OpeningExplorerProps {
  onSelectOpeningToPlay: (opening: OpeningVariation) => void;
}

export const OpeningExplorer: React.FC<OpeningExplorerProps> = ({ onSelectOpeningToPlay }) => {
  const [filter, setFilter] = useState<'all' | 'e4' | 'd4'>('all');
  const [selectedOpening, setSelectedOpening] = useState<OpeningVariation>(MASTER_OPENINGS[0]);
  const [favorites, setFavorites] = useState<string[]>(() => storage.getFavoriteOpenings());

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = storage.toggleFavoriteOpening(id);
    setFavorites(next);
  };

  const filtered = MASTER_OPENINGS.filter((op) => {
    if (filter === 'all') return true;
    return op.category === filter;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      {/* Left Column: Opening List */}
      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Master Opening Book
            </h3>
          </div>
          {/* Filter segment */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['all', 'e4', 'd4'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                  filter === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[500px]">
          {filtered.map((op) => {
            const isSelected = selectedOpening.id === op.id;
            const isFav = favorites.includes(op.id);

            return (
              <div
                key={op.id}
                onClick={() => setSelectedOpening(op)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                      {op.eco}
                    </span>
                    <span className="text-xs font-bold truncate max-w-[190px]">{op.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-[220px]">
                    {op.moves.slice(0, 6).join(' ')}...
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => toggleFav(op.id, e)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                    title={isFav ? 'Remove favorite' : 'Add favorite'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                      }`}
                    />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Opening Deep Dive & Strategy */}
      <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selectedOpening.eco}
                </span>
                <span className="text-xs font-mono text-slate-400">{selectedOpening.category}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{selectedOpening.name}</h2>
            </div>
            <button
              onClick={() => onSelectOpeningToPlay(selectedOpening)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice Position</span>
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedOpening.description}
          </p>

          {/* Theoretical Move Chain */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Standard Move Sequence
            </span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 leading-loose flex flex-wrap gap-2">
              {selectedOpening.moves.map((mv, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
                >
                  {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
                  <strong className="text-amber-300">{mv}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Key Strategic Ideas */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Key Strategic Goals & Principles
            </span>
            <div className="space-y-1.5">
              {selectedOpening.keyIdeas.map((idea, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300"
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{idea}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Status strip */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Engine Assessment:</span>
          <span className="text-amber-400 font-bold">{selectedOpening.evaluation}</span>
        </div>
      </div>
    </div>
  );
};
