'use client';

import React from 'react';
import { PlayerColor } from '@/lib/tavla/types';

interface CheckerPieceProps {
  color: PlayerColor;
  size?: number; // px diameter
  isSelected?: boolean;
  isLegalTarget?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  stackCount?: number;
  badgeText?: string | number | null;
  className?: string;
}

export const CheckerPiece: React.FC<CheckerPieceProps> = ({
  color,
  size,
  isSelected = false,
  isLegalTarget = false,
  isClickable = false,
  onClick,
  stackCount = 1,
  badgeText,
  className = '',
}) => {
  const isWhite = color === 'white';
  const displayBadge = badgeText !== undefined ? badgeText : (stackCount > 1 ? stackCount : null);
  const styleObj = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={styleObj}
      className={`relative rounded-full flex items-center justify-center transition-all duration-150 select-none shrink-0 ${
        isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${
        isSelected
          ? 'ring-4 ring-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.9)] z-30 scale-105'
          : isLegalTarget
          ? 'ring-2 ring-[#34d399] shadow-[0_0_10px_rgba(52,211,153,0.7)]'
          : 'shadow-[0_3px_6px_rgba(0,0,0,0.6)]'
      } ${className}`}
    >
      {/* Outer Checker Shell */}
      <div
        className={`w-full h-full rounded-full p-[2px] ${
          isWhite
            ? 'bg-gradient-to-b from-[#fffefc] via-[#ede3d1] to-[#c9b79b] border border-[#d9c7af]'
            : 'bg-gradient-to-b from-[#2e1d14] via-[#1c110b] to-[#0a0604] border border-[#4a2e1d]'
        }`}
      >
        {/* Inner Engraved Concentric Ring (Authentic Marquetry Woodcraft) */}
        <div
          className={`w-full h-full rounded-full flex items-center justify-center p-[2px] sm:p-[3px] ${
            isWhite
              ? 'bg-gradient-to-tr from-[#ede4d4] via-[#fdfbf7] to-[#e4d7c0] border border-[#bfa583]/50 shadow-inner'
              : 'bg-gradient-to-tr from-[#1b1009] via-[#29170e] to-[#120a05] border border-[#6b4226]/60 shadow-inner'
          }`}
        >
          {/* Central Mother-of-Pearl / Walnut Medallion */}
          <div
            className={`w-[60%] h-[60%] rounded-full flex items-center justify-center ${
              isWhite
                ? 'bg-radial from-[#ffffff] via-[#f7f1e6] to-[#d8c5a9] border border-[#cab598]/60 shadow-sm'
                : 'bg-radial from-[#382013] via-[#24140b] to-[#0d0704] border border-[#85532f]/40 shadow-sm'
            }`}
          >
            {/* Specular Highlight Spot */}
            <div
              className={`w-1.5 h-1 sm:w-2 sm:h-1 rounded-full ${
                isWhite ? 'bg-white/90 blur-[0.5px]' : 'bg-[#a16207]/30 blur-[0.5px]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Stack Count Indicator if provided */}
      {displayBadge !== null && displayBadge !== undefined && (
        <span
          className={`absolute -bottom-1 -right-1 min-w-[17px] h-[17px] sm:min-w-[19px] sm:h-[19px] px-1 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-md border z-20 ${
            isWhite
              ? 'bg-[#29170e] text-[#fef3c7] border-[#d97706]/70'
              : 'bg-[#fef3c7] text-[#1c110b] border-[#92400e]/80'
          }`}
        >
          {displayBadge}
        </span>
      )}
    </div>
  );
};
