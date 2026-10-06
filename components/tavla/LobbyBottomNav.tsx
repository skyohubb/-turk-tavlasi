'use client';

import React from 'react';
import type { LobbyRoom } from './LobbyRooms';

interface LobbyBottomNavProps {
  room: LobbyRoom;
  onChange: (room: LobbyRoom) => void;
}

const TABS: Array<{ id: LobbyRoom; icon: string; label: string }> = [
  { id: 'oyna', icon: '🎲', label: 'Oyna' },
  { id: 'magaza', icon: '🪵', label: 'Mağaza' },
  { id: 'ikram', icon: '🎁', label: 'İkram' },
  { id: 'lig', icon: '🏆', label: 'Lig' },
  { id: 'profil', icon: '👤', label: 'Profil' },
];

export const LobbyBottomNav: React.FC<LobbyBottomNavProps> = ({ room, onChange }) => (
  <nav className="fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 bg-[#140904]/95 backdrop-blur-xl border-t border-white/[0.08]">
    <div className="max-w-lg mx-auto grid grid-cols-5 gap-1">
      {TABS.map(t => {
        const active = room === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all active:scale-95 ${
              active
                ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50'
                : 'text-amber-200/50 border border-transparent hover:text-amber-200'
            }`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">{t.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
