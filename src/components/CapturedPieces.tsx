import React from 'react';
import { ChessPiece } from '../chess/pieces';
import { PieceColor, PieceType, PieceThemeId } from '../types/chess';

interface CapturedPiecesProps {
  color: PieceColor;
  capturedPieces: PieceType[];
  materialAdvantage: number;
  pieceTheme?: PieceThemeId;
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  color,
  capturedPieces,
  materialAdvantage,
  pieceTheme = 'classic',
}) => {
  // Sort pieces by standard value for clean visual presentation
  const order: Record<PieceType, number> = { q: 5, r: 4, b: 3, n: 2, p: 1, k: 0 };
  const sorted = [...capturedPieces].sort((a, b) => order[b] - order[a]);

  return (
    <div className="flex items-center gap-1.5 h-6 overflow-hidden">
      <div className="flex items-center -space-x-1.5">
        {sorted.map((type, idx) => (
          <div key={idx} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 opacity-90 drop-shadow">
            <ChessPiece type={type} color={color} theme={pieceTheme} />
          </div>
        ))}
      </div>
      {materialAdvantage > 0 && (
        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
          +{materialAdvantage}
        </span>
      )}
    </div>
  );
};
