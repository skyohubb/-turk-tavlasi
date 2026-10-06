'use client';

import React from 'react';
import { Dices, Store, Gift, Trophy, UserRound } from 'lucide-react';
import type { LobbyRoom } from './LobbyRooms';

interface LobbyBottomNavProps {
  room: LobbyRoom;
  onChange: (room: LobbyRoom) => void;
}

const TABS: Array<{ id: LobbyRoom; Icon: React.ComponentType<{ className?: string }>; label: string; activeGlow: string }> = [
  { id: 'oyna', Icon: Dices, label: 'Oyna', activeGlow: 'shadow-[0_0_18px_rgba(245,158,11,0.45)]' },
  { id: 'magaza', Icon: Store, label: 'Mağaza', activeGlow: 'shadow-[0_0_18px_rgba(217,119,6,0.45)]' },
  { id: 'ikram', Icon: Gift, label: 'İkram', activeGlow: 'shadow-[0_0_18px_rgba(52,211,153,0.4)]' },
  { id: 'lig', Icon: Trophy, label: 'Lig', activeGlow: 'shadow-[0_0_18px_rgba(250,204,21,0.45)]' },
  { id: 'profil', Icon: UserRound, label: 'Profil', activeGlow: 'shadow-[0_0_18px_rgba(56,189,248,0.4)]' },
];

export const LobbyBottomNav: React.FC<LobbyBottomNavProps> = ({ room, onChange }) => (
  <nav className="fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 bg-[#140904]/95 backdrop-blur-xl border-t border-amber-500/20 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
    <div className="max-w-lg mx-auto grid grid-cols-5 gap-1.5">
      {TABS.map(({ id, Icon, label, activeGlow }) => {
        const active = room === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-200 active:scale-95 ${
              active
                ? `bg-gradient-to-b from-amber-500/30 to-amber-600/10 text-amber-200 border border-amber-400/60 ${activeGlow}`
                : 'text-amber-200/40 border border-transparent hover:text-amber-200/80 hover:bg-white/[0.04]'
            }`}
          >
            {active && (
              <span className="absolute -top-[9px] w-8 h-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />
            )}
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest font-serif-tavla">{label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
