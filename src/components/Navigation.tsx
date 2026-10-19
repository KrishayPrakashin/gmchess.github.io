import React from 'react';
import { Settings, RefreshCw, Smartphone, ShieldAlert, Award } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type MainTab =
  | 'play'
  | 'analysis'
  | 'puzzles'
  | 'openings'
  | 'academy'
  | 'history';

interface NavigationProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenSettings: () => void;
  onOpenCrossPlatform: () => void;
  onNewGame: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenCrossPlatform,
  onNewGame,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-slate-800 bg-[#0c1017]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('play');
          }}
          className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <span className="text-slate-950 font-black text-xs font-serif">♔</span>
          </div>
          <span className="font-serif tracking-normal text-amber-300">Grandmaster</span>
          <span className="text-slate-400 font-sans font-medium text-xs hidden sm:inline">Chess</span>
        </a>
      </div>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
        <button
          onClick={() => onSelectTab('play')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'play' ? 'text-amber-300 font-bold' : 'hover:text-white'
          }`}
        >
          Play Board
        </button>
        <button
          onClick={() => onSelectTab('analysis')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'analysis' ? 'text-amber-300 font-bold' : 'hover:text-white'
          }`}
        >
          Game Analysis
        </button>
        <button
          onClick={() => onSelectTab('puzzles')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'puzzles' ? 'text-amber-300 font-bold' : 'hover:text-white'
          }`}
        >
          Tactical Puzzles
        </button>
        <button
          onClick={() => onSelectTab('openings')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'openings' ? 'text-amber-300 font-bold' : 'hover:text-white'
          }`}
        >
          Opening Book
        </button>
        <button
          onClick={() => onSelectTab('academy')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'academy' ? 'text-amber-300 font-bold' : 'hover:text-white'
          }`}
        >
          Master Lessons
        </button>
        <button
          onClick={() => onSelectTab('history')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'history' ? 'text-amber-300 font-bold' : 'hover:text-white'
          }`}
        >
          Archive
        </button>
      </nav>

      {/* Zone 3: Primary Actions (New Game, Install PWA, Platform Info, Settings) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <PWAInstallButton />

        <button
          onClick={onOpenCrossPlatform}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          title="Cross-platform deployment instructions (Android, iOS, Desktop)"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="whitespace-nowrap">Platforms</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          title="Board & Engine Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onNewGame}
          className="px-3 sm:px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>
    </header>
  );
};
