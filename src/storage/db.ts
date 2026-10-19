import { UserSettings, SavedGame, TimeControlKey } from '../types/chess';

const SETTINGS_KEY = 'gm_chess_user_settings_v1';
const ACTIVE_GAME_KEY = 'gm_chess_active_game_v1';
const COMPLETED_GAMES_KEY = 'gm_chess_completed_games_v1';
const PUZZLE_PROGRESS_KEY = 'gm_chess_puzzle_progress_v1';
const FAVORITE_OPENINGS_KEY = 'gm_chess_favorite_openings_v1';
const CUSTOM_POSITIONS_KEY = 'gm_chess_custom_positions_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  boardTheme: 'tournament',
  pieceTheme: 'classic',
  soundEnabled: true,
  soundVolume: 0.6,
  showCoordinates: true,
  showLegalMoves: true,
  showBestMoveArrow: true,
  autoQueenPromotion: false,
  engineLevel: 4, // Intermediate 1500
  defaultTimeControl: '5+3',
  playerSidePreference: 'w',
};

export interface ActiveGameState {
  fen: string;
  history: string[]; // SAN array
  turn: 'w' | 'b';
  whiteTimeMs: number;
  blackTimeMs: number;
  timeControl: TimeControlKey;
  mode: string;
  playerColor: 'w' | 'b';
  engineLevel: number;
  lastUpdated: number;
}

export interface PuzzleProgress {
  completedPuzzleIds: string[];
  streak: number;
  bestStreak: number;
  lastSolvedAt?: number;
}

export interface CustomPosition {
  id: string;
  title: string;
  fen: string;
  date: string;
}

class ChessStorage {
  // --- Settings ---
  public getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // Fallback to defaults
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  // --- Active Game Autosave ---
  public getActiveGame(): ActiveGameState | null {
    try {
      const data = localStorage.getItem(ACTIVE_GAME_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return null;
  }

  public saveActiveGame(game: ActiveGameState | null): void {
    try {
      if (game) {
        localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(game));
      } else {
        localStorage.removeItem(ACTIVE_GAME_KEY);
      }
    } catch (e) {
      console.warn('Active game storage error:', e);
    }
  }

  // --- Completed Games History ---
  public getCompletedGames(): SavedGame[] {
    try {
      const data = localStorage.getItem(COMPLETED_GAMES_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return [];
  }

  public saveCompletedGame(game: SavedGame): void {
    try {
      const list = this.getCompletedGames();
      // Keep most recent 50 games
      const updated = [game, ...list.filter((g) => g.id !== game.id)].slice(0, 50);
      localStorage.setItem(COMPLETED_GAMES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save completed game:', e);
    }
  }

  public clearCompletedGames(): void {
    try {
      localStorage.removeItem(COMPLETED_GAMES_KEY);
    } catch {
      // ignore
    }
  }

  // --- Puzzle Progress ---
  public getPuzzleProgress(): PuzzleProgress {
    try {
      const data = localStorage.getItem(PUZZLE_PROGRESS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return { completedPuzzleIds: [], streak: 0, bestStreak: 0 };
  }

  public recordPuzzleSolved(puzzleId: string): PuzzleProgress {
    const progress = this.getPuzzleProgress();
    const alreadyCompleted = progress.completedPuzzleIds.includes(puzzleId);

    const newCompleted = alreadyCompleted
      ? progress.completedPuzzleIds
      : [...progress.completedPuzzleIds, puzzleId];

    const newStreak = progress.streak + 1;
    const newBest = Math.max(newStreak, progress.bestStreak);

    const updated: PuzzleProgress = {
      completedPuzzleIds: newCompleted,
      streak: newStreak,
      bestStreak: newBest,
      lastSolvedAt: Date.now(),
    };

    try {
      localStorage.setItem(PUZZLE_PROGRESS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save puzzle progress:', e);
    }

    return updated;
  }

  public resetPuzzleStreak(): void {
    const progress = this.getPuzzleProgress();
    const updated = { ...progress, streak: 0 };
    try {
      localStorage.setItem(PUZZLE_PROGRESS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to reset streak:', e);
    }
  }

  // --- Favorite Openings ---
  public getFavoriteOpenings(): string[] {
    try {
      const data = localStorage.getItem(FAVORITE_OPENINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return ['italian-game', 'sicilian-defence-najdorf'];
  }

  public toggleFavoriteOpening(id: string): string[] {
    const favs = this.getFavoriteOpenings();
    const next = favs.includes(id) ? favs.filter((item) => item !== id) : [...favs, id];
    try {
      localStorage.setItem(FAVORITE_OPENINGS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save favorite openings:', e);
    }
    return next;
  }

  // --- Custom Positions ---
  public getCustomPositions(): CustomPosition[] {
    try {
      const data = localStorage.getItem(CUSTOM_POSITIONS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return [];
  }

  public saveCustomPosition(pos: CustomPosition): void {
    try {
      const positions = this.getCustomPositions();
      const updated = [pos, ...positions.filter((p) => p.id !== pos.id)].slice(0, 30);
      localStorage.setItem(CUSTOM_POSITIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save custom position:', e);
    }
  }

  public deleteCustomPosition(id: string): void {
    try {
      const positions = this.getCustomPositions();
      const updated = positions.filter((p) => p.id !== id);
      localStorage.setItem(CUSTOM_POSITIONS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

export const storage = new ChessStorage();
