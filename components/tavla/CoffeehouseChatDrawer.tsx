'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  COFFEEHOUSE_PHRASE_CATEGORIES,
  ChatMessage,
} from '@/lib/tavla/chatPhrases';
import { SafeImage } from './SafeImage';

interface CoffeehouseChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isConnected: boolean;
  cooldownSeconds: number;
  onSendPhrase: (phrase: string, categoryIcon?: string) => void;
}

export const CoffeehouseChatDrawer: React.FC<CoffeehouseChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  isConnected,
  cooldownSeconds,
  onSendPhrase,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('banter');
  const [viewTab, setViewTab] = useState<'phrases' | 'history'>('phrases');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const selectedCategory =
    COFFEEHOUSE_PHRASE_CATEGORIES.find(c => c.id === activeCategory) ||
    COFFEEHOUSE_PHRASE_CATEGORIES[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#1f1008] via-[#160b05] to-[#0c0502] border-2 border-amber-400/50 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Authentic Wood Inlay Texture Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
            <SafeImage
              src="/images/ottoman_wood_inlay_texture.jpg"
              alt="Ahşap Doku"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Brass Corner Brackets */}
          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/70 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/70 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/70 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/70 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow flex items-center justify-center text-sm">
                💬
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-tavla font-black text-sm sm:text-base text-[#fef3c7]">
                    Kahvehane Sohbeti &amp; Nükteler
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                      }`}
                    />
                    {isConnected ? 'Canlı Bağlantı' : 'Bağlanıyor'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/60">
                  Masadaki rakibinize otantik tavla sözleri gönderin
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 hover:text-white border border-rose-400/50 text-xs font-serif-tavla font-bold flex items-center gap-1.5 transition-all shadow active:scale-95"
              title="Kapat"
            >
              <span className="text-sm">✕</span>
              <span>Kapat</span>
            </button>
          </div>

          {/* Top Switcher: Sözler vs Sohbet Geçmişi */}
          <div className="relative z-10 p-2 sm:px-4 bg-black/30 border-b border-white/5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewTab('phrases')}
                className={`px-3 py-1.5 rounded-xl font-serif-tavla text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewTab === 'phrases'
                    ? 'bg-amber-500 text-stone-950 shadow-md ring-1 ring-amber-300'
                    : 'bg-white/[0.05] text-amber-200/70 hover:text-white'
                }`}
              >
                <span>📜</span>
                <span>Otantik Sözler</span>
              </button>
              <button
                onClick={() => setViewTab('history')}
                className={`px-3 py-1.5 rounded-xl font-serif-tavla text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewTab === 'history'
                    ? 'bg-amber-500 text-stone-950 shadow-md ring-1 ring-amber-300'
                    : 'bg-white/[0.05] text-amber-200/70 hover:text-white'
                }`}
              >
                <span>🗣️</span>
                <span>Masa Geçmişi</span>
                {messages.length > 0 && (
                  <span className="bg-amber-400 text-stone-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {messages.length}
                  </span>
                )}
              </button>
            </div>

            {cooldownSeconds > 0 && (
              <div className="text-[10px] font-bold text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-400/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Bekleme: {cooldownSeconds}s</span>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4">
            {viewTab === 'phrases' ? (
              <div className="space-y-3">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {COFFEEHOUSE_PHRASE_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-serif-tavla whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                        activeCategory === cat.id
                          ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-white/[0.04] border-white/10 text-amber-100/60 hover:text-white'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Phrase Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {selectedCategory.phrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSendPhrase(phrase, selectedCategory.icon);
                        if (window.innerWidth < 640) {
                          onClose();
                        }
                      }}
                      disabled={cooldownSeconds > 0}
                      className="p-3 rounded-2xl bg-white/[0.04] hover:bg-amber-500/20 text-left border border-white/10 hover:border-amber-400/50 transition-all text-xs font-serif-tavla text-[#fef3c7] leading-relaxed group disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-start gap-2"
                    >
                      <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                        {selectedCategory.icon}
                      </span>
                      <span className="flex-1 font-medium">{phrase}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat History */
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-amber-200/50 italic">
                    Masada henüz sohbet başlamadı. Otantik bir söz seçip gönderin!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isPlayer = msg.sender === 'player';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${
                          isPlayer ? 'flex-row-reverse text-right' : 'flex-row text-left'
                        }`}
                      >
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-400/40 shrink-0 bg-black">
                          <SafeImage
                            src={msg.avatar}
                            alt={msg.senderName}
                            className="w-full h-full object-cover"
                            fallbackSrc="/images/avatar_genc_cirak.jpg"
                            fallbackIcon="👤"
                            fallbackText={msg.senderName}
                          />
                        </div>
                        <div
                          className={`max-w-[75%] p-2.5 rounded-2xl border ${
                            isPlayer
                              ? 'bg-amber-500/20 border-amber-400/40 text-amber-100 rounded-tr-none'
                              : 'bg-white/[0.05] border-white/15 text-[#fef3c7] rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-amber-300 font-bold justify-between">
                            <span>{msg.senderName}</span>
                            <span className="text-white/40 font-normal">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="font-serif-tavla text-xs font-semibold leading-relaxed">
                            {msg.phrase}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer Close Bar */}
          <div className="relative z-10 px-4 py-2.5 bg-black/40 border-t border-white/[0.08] flex items-center justify-between shrink-0">
            <span className="text-[11px] text-amber-200/60">
              Sesli nükte &amp; kahvehane deyimleri
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-amber-200 hover:text-white border border-white/15 text-xs font-serif-tavla font-bold transition-all active:scale-95"
            >
              ✕ Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
