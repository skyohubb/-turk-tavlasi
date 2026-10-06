'use client';

import React from 'react';
import { AVATAR_FRAMES } from '@/lib/tavla/customizationData';
import { SafeImage } from './SafeImage';

interface PlayerAvatarProps {
  avatarUrl?: string;
  frameId?: string;
  size?: number; // size in px (e.g. 48, 56, 64)
  showBadge?: boolean;
  className?: string;
  alt?: string;
  onClick?: () => void;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatarUrl = '/images/avatar_genc_cirak.jpg',
  frameId = 'frame_classic_wood',
  size = 48,
  showBadge = true,
  className = '',
  alt = 'Oyuncu Portresi',
  onClick,
}) => {
  const frame = AVATAR_FRAMES.find(f => f.id === frameId) || AVATAR_FRAMES[0];
  const isLegendary = frame.rarity === 'legendary' || frame.id === 'frame_emerald_padisah';

  return (
    <div
      onClick={onClick}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative rounded-full select-none shrink-0 ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {/* Outer Border & Ring Glow matching frame */}
      <div
        className={`w-full h-full rounded-full overflow-hidden ${frame.borderClass} ${frame.ringClass} ${frame.glowClass} ${
          isLegendary ? 'animate-pulse' : ''
        } bg-[#1a0e07] shadow-lg flex items-center justify-center`}
      >
        <SafeImage
          src={avatarUrl || '/images/avatar_genc_cirak.jpg'}
          alt={alt}
          className="w-full h-full object-cover"
          fallbackSrc="/images/avatar_genc_cirak.jpg"
          fallbackIcon="👤"
          fallbackText={alt}
        />
      </div>

      {/* Frame Status Badge Icon */}
      {showBadge && frame.badgeIcon && (
        <span
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1e1008] border border-[#d97706]/70 shadow-md flex items-center justify-center text-[10px] z-10"
          title={`${frame.name} (${frame.badgeIcon})`}
        >
          {frame.badgeIcon}
        </span>
      )}
    </div>
  );
};
