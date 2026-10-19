import React from 'react';
import { PieceColor, PieceType, PieceThemeId } from '../types/chess';

interface PieceProps {
  type: PieceType;
  color: PieceColor;
  theme?: PieceThemeId;
  className?: string;
}

export const ChessPiece: React.FC<PieceProps> = ({
  type,
  color,
  theme = 'classic',
  className = 'w-full h-full',
}) => {
  const isWhite = color === 'w';

  // Palette settings per theme
  const whiteFill = theme === 'neo' ? '#f8fafc' : isWhite ? '#ffffff' : '#1e293b';
  const whiteStroke = theme === 'neo' ? '#475569' : isWhite ? '#27272a' : '#09090b';
  const blackFill = theme === 'neo' ? '#0f172a' : '#18181b';
  const blackStroke = theme === 'neo' ? '#38bdf8' : '#000000';

  const fill = isWhite ? whiteFill : blackFill;
  const stroke = isWhite ? whiteStroke : blackStroke;
  const highlight = isWhite ? '#ffffff' : '#3f3f46';

  const renderClassicPiece = () => {
    switch (type) {
      case 'p': // Pawn
        return (
          <g>
            <path
              d="M22 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-3 0-5 2-6 5 2 1 4 1 6 1s4 0 6-1c-1-3-3-5-6-5zm-7 8c0 4 3 8 7 8s7-4 7-8c-2 1-4 1-7 1s-5 0-7-1zm-4 12c0 2 2 4 4 4h14c2 0 4-2 4-4 0-1-1-2-2-3H13c-1 1-2 2-2 3zm-2 6c0 1.5 1.5 3 3 3h20c1.5 0 3-1.5 3-3H9z"
              transform="scale(1.02) translate(0.5, 0)"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {isWhite && (
              <circle cx="21" cy="7.5" r="1.5" fill={highlight} opacity="0.8" />
            )}
          </g>
        );

      case 'r': // Rook
        return (
          <g>
            <path
              d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm2-4c0-3 2-6 4-7v-6h-4V11h5v4h4v-4h5v4h4v-4h5v8h-4v6c2 1 4 4 4 7H14z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 29h17m-18-7h19"
              stroke={isWhite ? '#a1a1aa' : '#52525b'}
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
        );

      case 'n': // Knight
        return (
          <g>
            <path
              d="M22 10c-3 0-5 2-6 5 1 1 3 1 5 1 2 0 4 0 5-1-1-3-2-5-4-5zm-9.5 22.5c2-2 4.5-3 7.5-3s5.5 1 7.5 3c-2 2-4.5 3-7.5 3s-5.5-1-7.5-3zM9 39h27v-3H9v3z"
              fill="none"
            />
            <path
              d="M9.5 25.5c-1.5 1.5-1.5 4.5 0 6 3 3 7 4.5 11 4.5s8-1.5 11-4.5c1.5-1.5 1.5-4.5 0-6-1.5 2-3.5 3.5-6 4-1.5.5-3.5.5-5 .5s-3.5 0-5-.5c-2.5-.5-4.5-2-6-4z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path
              d="M31 16c-.5-1.5-2-3-4-3.5-1-.2-2 .2-2.5 1-.5.7-.3 1.8.3 2.5 1.5 1.5 3 3.5 3 6 0 1.5-.5 3-1.5 4-2-2-4.5-3-7.5-3s-5.5 1-7.5 3c-1.5-1.5-2-3.5-2-6 0-3 2-5.5 4-7.5 1-1 1-2.5 0-3.5-1-1-2.5-1-3.5 0-3 3-5.5 7-5.5 11.5 0 3 .8 5.8 2.3 8.2 2 3.3 5.3 5.3 9.2 5.3s7.2-2 9.2-5.3c1.5-2.4 2.3-5.2 2.3-8.2 0-2-.5-4-1.3-5.9z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="15.5" cy="18.5" r="1.5" fill={isWhite ? '#27272a' : '#ffffff'} />
            <path
              d="M26 14.5c-1 1-1.5 2.5-1.5 4"
              stroke={isWhite ? '#a1a1aa' : '#71717a'}
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
        );

      case 'b': // Bishop
        return (
          <g>
            <path
              d="M9 39h27v-3H9v3zm6-3c0-3 2-5 4-6h8c2 1 4 3 4 6H15zm7.5-28a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0 2c-4 0-7.5 4-7.5 9 0 3 1.5 6 3.5 8 1.5 1.5 2.5 3 2.5 5h3c0-2 1-3.5 2.5-5 2-2 3.5-5 3.5-8 0-5-3.5-9-7.5-9z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Bishop cross cut */}
            <path
              d="M20.5 16l4 4m-4 0l4-4"
              stroke={isWhite ? '#52525b' : '#d4d4d8'}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        );

      case 'q': // Queen
        return (
          <g>
            <path
              d="M9 39h27v-3H9v3zm3-3c0-3 2-5 4-6h14c2 1 4 3 4 6H12z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path
              d="M10 27l2.5-14 6 7 4-11 4 11 6-7 2.5 14H10z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Queen Crown Jewels */}
            <circle cx="10" cy="11.5" r="1.8" fill={fill} stroke={stroke} strokeWidth="1.2" />
            <circle cx="16" cy="18" r="1.8" fill={fill} stroke={stroke} strokeWidth="1.2" />
            <circle cx="22.5" cy="7.5" r="2.2" fill={fill} stroke={stroke} strokeWidth="1.2" />
            <circle cx="29" cy="18" r="1.8" fill={fill} stroke={stroke} strokeWidth="1.2" />
            <circle cx="35" cy="11.5" r="1.8" fill={fill} stroke={stroke} strokeWidth="1.2" />
          </g>
        );

      case 'k': // King
        return (
          <g>
            <path
              d="M9 39h27v-3H9v3zm3-3c0-3 2-5 4-6h14c2 1 4 3 4 6H12z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path
              d="M22.5 14c-4.5 0-8 3-8 7.5 0 3 2 5.5 4.5 7.5 1 1 2 2 2 3h3c0-1 1-2 2-3 2.5-2 4.5-4.5 4.5-7.5 0-4.5-3.5-7.5-8-7.5z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* King Cross */}
            <path
              d="M22.5 5v7m-3.5-4.5h7"
              stroke={stroke}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 45 45"
      className={`${className} drop-shadow-sm select-none pointer-events-none transition-transform duration-100`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {renderClassicPiece()}
    </svg>
  );
};
