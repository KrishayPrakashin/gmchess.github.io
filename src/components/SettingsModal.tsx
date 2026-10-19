import React from 'react';
import { X, Volume2, VolumeX, Sliders, Palette, Shield, Sparkles } from 'lucide-react';
import { UserSettings, BoardThemeId, PieceThemeId } from '../types/chess';
import { BOARD_THEMES } from '../chess/themes';
import { ENGINE_LEVELS } from '../engine/engine';
import { sound } from '../chess/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...settings, [key]: value };
    if (key === 'soundEnabled') {
      sound.setEnabled(value as boolean);
    }
    if (key === 'soundVolume') {
      sound.setVolume(value as number);
    }
    onUpdateSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Board & Engine Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Board Theme */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            Board Theme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(BOARD_THEMES).map((theme) => {
              const isSelected = settings.boardTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => update('boardTheme', theme.id)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0 border border-black/30">
                    <div className={theme.lightSquare} />
                    <div className={theme.darkSquare} />
                    <div className={theme.darkSquare} />
                    <div className={theme.lightSquare} />
                  </div>
                  <span className="text-xs truncate">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Piece Theme */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Piece Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'classic', label: 'Staunton Classic' },
                { id: 'modern', label: 'Modern Minimal' },
                { id: 'neo', label: 'Neo High Contrast' },
              ] as { id: PieceThemeId; label: string }[]
            ).map((pt) => (
              <button
                key={pt.id}
                onClick={() => update('pieceTheme', pt.id)}
                className={`py-2 px-3 rounded-lg border text-center text-xs font-semibold transition cursor-pointer ${
                  settings.pieceTheme === pt.id
                    ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Engine Default Difficulty */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Computer Engine Strength
            </label>
            <span className="font-mono text-xs text-amber-400 font-bold">
              Level {settings.engineLevel}: {ENGINE_LEVELS[settings.engineLevel - 1]?.name} (~{ENGINE_LEVELS[settings.engineLevel - 1]?.elo} Elo)
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={settings.engineLevel}
            onChange={(e) => update('engineLevel', parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Beginner (400)</span>
            <span>Intermediate (1500)</span>
            <span>Grandmaster (2700+)</span>
          </div>
        </div>

        {/* Sound Controls */}
        <div className="space-y-3 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-xs font-bold text-slate-200">Chess Audio (Web Audio API)</span>
            </div>
            <button
              onClick={() => update('soundEnabled', !settings.soundEnabled)}
              className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                settings.soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {settings.soundEnabled && (
            <div className="flex items-center gap-3 pl-6">
              <span className="text-[11px] text-slate-400 shrink-0">Volume</span>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={settings.soundVolume}
                onChange={(e) => update('soundVolume', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Toggles (Coordinates, Legal Moves, Best Move Arrow, Auto Queen) */}
        <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-slate-300 font-medium">Show Board Coordinates (1-8, a-h)</span>
            <input
              type="checkbox"
              checked={settings.showCoordinates}
              onChange={(e) => update('showCoordinates', e.target.checked)}
              className="accent-amber-500 cursor-pointer w-4 h-4 rounded"
            />
          </label>
          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-slate-300 font-medium">Show Legal Move Indicators (Dots/Rings)</span>
            <input
              type="checkbox"
              checked={settings.showLegalMoves}
              onChange={(e) => update('showLegalMoves', e.target.checked)}
              className="accent-amber-500 cursor-pointer w-4 h-4 rounded"
            />
          </label>
          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-slate-300 font-medium">Show Engine Best-Move Arrow</span>
            <input
              type="checkbox"
              checked={settings.showBestMoveArrow}
              onChange={(e) => update('showBestMoveArrow', e.target.checked)}
              className="accent-amber-500 cursor-pointer w-4 h-4 rounded"
            />
          </label>
          <label className="flex items-center justify-between py-1 cursor-pointer">
            <span className="text-slate-300 font-medium">Always Auto-Promote to Queen</span>
            <input
              type="checkbox"
              checked={settings.autoQueenPromotion}
              onChange={(e) => update('autoQueenPromotion', e.target.checked)}
              className="accent-amber-500 cursor-pointer w-4 h-4 rounded"
            />
          </label>
        </div>

        {/* Close Button */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
