import { BoardTheme, BoardThemeId } from '../types/chess';

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  tournament: {
    id: 'tournament',
    name: 'Tournament Green',
    lightSquare: 'bg-[#eeeed2]',
    darkSquare: 'bg-[#769656]',
    selectedSquare: 'bg-[#baca44]/80 ring-4 ring-[#baca44]',
    lastMoveSquare: 'bg-[#f7ec74]/40',
    borderClass: 'border-[#4a6332]',
  },
  wood: {
    id: 'wood',
    name: 'Classic Walnut',
    lightSquare: 'bg-[#e3c498]',
    darkSquare: 'bg-[#a16f40]',
    selectedSquare: 'bg-[#d49b53]/90 ring-4 ring-[#d49b53]',
    lastMoveSquare: 'bg-[#f4d06f]/40',
    borderClass: 'border-[#603b1d]',
  },
  slate: {
    id: 'slate',
    name: 'Midnight Slate',
    lightSquare: 'bg-[#94a3b8]',
    darkSquare: 'bg-[#334155]',
    selectedSquare: 'bg-[#38bdf8]/50 ring-4 ring-[#38bdf8]',
    lastMoveSquare: 'bg-[#38bdf8]/30',
    borderClass: 'border-[#1e293b]',
  },
  ocean: {
    id: 'ocean',
    name: 'Nordic Ocean',
    lightSquare: 'bg-[#cce3f0]',
    darkSquare: 'bg-[#487a99]',
    selectedSquare: 'bg-[#0ea5e9]/60 ring-4 ring-[#0ea5e9]',
    lastMoveSquare: 'bg-[#38bdf8]/40',
    borderClass: 'border-[#29546f]',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Gold',
    lightSquare: 'bg-[#27272a]',
    darkSquare: 'bg-[#18181b]',
    selectedSquare: 'bg-[#eab308]/40 ring-4 ring-[#eab308]',
    lastMoveSquare: 'bg-[#ca8a04]/30',
    borderClass: 'border-[#3f3f46]',
  },
};
