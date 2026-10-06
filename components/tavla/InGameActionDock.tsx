'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoveAdvice } from '@/lib/tavla/moveAdvisor';
import {
  AUTHENTIC_VOICE_PHRASES,
  VoicePhrase,
  voicePhraseEngine,
} from '@/lib/audio/voicePhrases';
import { soundEffects } from '@/lib/audio/soundEffects';
import { PlayerColor } from '@/lib/tavla/types';

export type ChatVisibilityMode = 'expanded' | 'notifications_only' | 'hidden';

interface InGameActionDockProps {
  advice: MoveAdvice | null;
  alternatives: MoveAdvice[];
  isAdvisorEnabled: boolean;
  onToggleAdvisor: () => void;
  onApplyMove?: (advice: MoveAdvice) => void;
  isBlitz?: boolean;
  masterStreak?: number;
  onSendPhrase: (phrase: string, emoji: string) => void;
  disabled?: boolean;
  turn: PlayerColor;
  onOpenChatDrawer?: () => void;
  chatVisibilityMode?: ChatVisibilityMode;
  onChangeChatVisibilityMode?: (mode: ChatVisibilityMode) => void;
}

export const InGameActionDock: React.FC<InGameActionDockProps> = ({
  advice,
  alternatives,
  isAdvisorEnabled,
  onToggleAdvisor,
  onApplyMove,
  isBlitz = false,
  masterStreak = 0,
  onSendPhrase,
  disabled = false,
  turn,
  onOpenChatDrawer,
  chatVisibilityMode = 'expanded',
  onChangeChatVisibilityMode,
}) => {
  // Mobile / compact tab switcher: 'advisor' vs 'chat'
  const [activeTab, setActiveTab] = useState<'advisor' | 'chat'>('advisor');
  const [showAltPopover, setShowAltPopover] = useState<boolean>(false);
  const [showModeMenu, setShowModeMenu] = useState<boolean>(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const setMode = (mode: ChatVisibilityMode) => {
    onChangeChatVisibilityMode?.(mode);
    setShowModeMenu(false);
    soundEffects.playCheckerSlide();
  };

  const handlePhraseClick = (phrase: VoicePhrase) => {
    if (disabled) return;

    setPlayingId(phrase.id);
    soundEffects.playVoicePhraseAccent(phrase.soundToneFreq || 740);

    voicePhraseEngine.speak(
      phrase,
      () => setPlayingId(phrase.id),
      () => setPlayingId(null)
    );

    onSendPhrase(phrase.phrase, phrase.emoji);

    setTimeout(() => {
      setPlayingId(prev => (prev === phrase.id ? null : prev));
    }, 2500);
  };

  const getCategoryBadge = (category?: MoveAdvice['category']) => {
    switch (category) {
      case 'kapi_alma':
        return { label: '🏰 Kapı', bg: 'bg-amber-500/20 text-amber-300 border-amber-400/40' };
      case 'kirma':
        return { label: '⚔️ Vurgun', bg: 'bg-rose-500/20 text-rose-300 border-rose-400/40' };
      case 'toplama':
        return { label: '🏆 Topla', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' };
      case 'kacis':
        return { label: '🏃 Kaçış', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' };
      default:
        return { label: '🛡️ Emniyet', bg: 'bg-stone-500/20 text-stone-300 border-stone-400/40' };
    }
  };

  return (
    <div className="relative w-full select-none my-1 shrink-0">
      {/* FIXED HEIGHT CONTAINER: 52px on mobile, 54px on desktop - ZERO VERTICAL JUMPING */}
      <div className="relative w-full h-[52px] sm:h-[54px] rounded-2xl bg-gradient-to-r from-[#211108]/95 via-[#180c05]/95 to-[#120703]/95 border border-amber-400/35 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-xl px-2 sm:px-3 flex items-center justify-between gap-2 overflow-visible">
        
        {/* TAB SWITCHER PILLS (Always stays at fixed position on the left) */}
        <div className="flex items-center gap-1 shrink-0 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-2.5 py-1 rounded-lg text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'advisor'
                ? 'bg-amber-500 text-stone-950 shadow-md ring-1 ring-amber-300'
                : 'text-amber-200/70 hover:text-white'
            }`}
            title="Usta Hamle Danışmanı"
          >
            <span>💡</span>
            <span className="hidden sm:inline">Usta</span>
            <span className="sm:hidden">Tavsiye</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2.5 py-1 rounded-lg text-xs font-serif-tavla font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'text-amber-200/70 hover:text-white'
            }`}
            title="Sesli Kahvehane Sohbet İfadeleri"
          >
            <span>🗣️</span>
            <span className="hidden sm:inline">Sohbet</span>
            <span className="sm:hidden">Sesler</span>
          </button>
        </div>

        {/* CENTER / MAIN CONTENT AREA - Strict Fixed Single Row Layout */}
        <div className="flex-1 min-w-0 h-full flex items-center overflow-hidden px-1">
          {activeTab === 'advisor' ? (
            /* ADVISOR STRIP */
            isAdvisorEnabled ? (
              advice ? (
                <div className="w-full flex items-center justify-between gap-2 text-xs truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    {/* Category */}
                    {(() => {
                      const cat = getCategoryBadge(advice.category);
                      return (
                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded border ${cat.bg}`}>
                          {cat.label}
                        </span>
                      );
                    })()}

                    {/* Move notation */}
                    <span className="font-serif-tavla font-black text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30 whitespace-nowrap text-xs">
                      {advice.move.from === 'bar' ? 'Bar' : `${(advice.move.from as number) + 1}`} →{' '}
                      {advice.move.to === 'off' ? 'Topla' : `${(advice.move.to as number) + 1}`}
                    </span>

                    {/* Short reason */}
                    <span className="text-white/80 truncate text-xs hidden md:inline">
                      {advice.title}: {advice.reason}
                    </span>

                    {/* Blitz Bonus Badge */}
                    {isBlitz && (
                      <span className="shrink-0 text-[10px] font-bold text-rose-300 bg-rose-500/25 px-1.5 py-0.2 rounded-full border border-rose-400/30 animate-pulse hidden lg:inline">
                        ⚡ +3s
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Alternatives Popover Toggle */}
                    {alternatives.length > 0 && (
                      <button
                        onClick={() => setShowAltPopover(prev => !prev)}
                        className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] text-amber-200 text-[11px] font-semibold border border-white/10"
                        title="Diğer hamle seçenekleri"
                      >
                        {showAltPopover ? 'Kapat' : `+${alternatives.length}`}
                      </button>
                    )}

                    {/* Play Move Button */}
                    {onApplyMove && (
                      <button
                        onClick={() => onApplyMove(advice)}
                        disabled={disabled || turn !== 'white'}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-serif-tavla font-black text-xs shadow-md border border-amber-300 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                      >
                        <span>✨</span>
                        <span>Oyna</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between text-xs text-amber-200/60 px-1">
                  <span className="truncate">
                    {turn === 'white'
                      ? '🎲 Zarları atın, usta tavsiyesi burada belirecek.'
                      : '⏳ Rakibin hamlesi bekleniyor...'}
                  </span>
                  {masterStreak > 0 && (
                    <span className="text-[10px] text-amber-300 font-bold bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30 whitespace-nowrap shrink-0">
                      ⚡ Seri: {masterStreak}/3
                    </span>
                  )}
                </div>
              )
            ) : (
              <div className="w-full flex items-center justify-between text-xs text-stone-400 px-1">
                <span>Usta Tavsiyesi devre dışı bırakıldı.</span>
              </div>
            )
          ) : (
            /* CHAT & SOUND PHRASES STRIP */
            chatVisibilityMode === 'expanded' ? (
              <div className="w-full h-full flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {AUTHENTIC_VOICE_PHRASES.map(phrase => {
                  const isPlaying = playingId === phrase.id;
                  return (
                    <button
                      key={phrase.id}
                      onClick={() => handlePhraseClick(phrase)}
                      disabled={disabled}
                      className={`shrink-0 px-2.5 py-1 rounded-xl font-serif-tavla text-xs font-bold transition-all flex items-center gap-1 border active:scale-95 disabled:opacity-50 ${
                        isPlaying
                          ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md ring-1 ring-amber-300'
                          : 'bg-white/[0.06] hover:bg-amber-500/20 text-[#fef3c7] border-white/10 hover:border-amber-400/40'
                      }`}
                      title={`"${phrase.phrase}" seslendir`}
                    >
                      <span>{phrase.emoji}</span>
                      <span className="whitespace-nowrap">{phrase.phrase}</span>
                    </button>
                  );
                })}
              </div>
            ) : chatVisibilityMode === 'notifications_only' ? (
              <div className="w-full flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold">🔔 Sadece Bildirimler</span>
                  <span className="text-[11px] text-amber-200/60 hidden sm:inline">
                    (Sohbet küçültüldü · Bildirimler açık)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMode('expanded')}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-400/40 font-bold text-xs flex items-center gap-1 active:scale-95"
                    title="Sohbeti Büyüt"
                  >
                    <span>🔼 Büyüt</span>
                  </button>
                  <button
                    onClick={() => setMode('hidden')}
                    className="px-2 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-stone-400 text-xs border border-white/10"
                    title="Tamamen Gizle"
                  >
                    <span>🔇 Gizle</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-1.5 text-stone-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-semibold text-rose-300">🔇 Tamamen Gizli (Odak Modu)</span>
                  <span className="text-[11px] text-stone-400 hidden sm:inline">
                    (Tüm sohbet &amp; balonlar gizlendi)
                  </span>
                </div>
                <button
                  onClick={() => setMode('expanded')}
                  className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95"
                  title="Sohbeti Büyüt / Aç"
                >
                  <span>🔼 Sohbeti Aç</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* RIGHT CONTROL: Advisor Toggle / Drawer Shortcut / Chat Toggle */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/10">
          {activeTab === 'advisor' ? (
            <button
              onClick={onToggleAdvisor}
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border transition-colors ${
                isAdvisorEnabled
                  ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-sm'
                  : 'bg-white/[0.05] text-white/50 border-white/10'
              }`}
              title={isAdvisorEnabled ? 'Danışmanı Kapat' : 'Danışmanı Aç'}
            >
              💡
            </button>
          ) : (
            <div className="flex items-center gap-1">
              {onOpenChatDrawer && (
                <button
                  onClick={onOpenChatDrawer}
                  className="px-2 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] text-amber-200 text-xs font-semibold border border-white/10 whitespace-nowrap hidden sm:inline"
                  title="Tüm Kahvehane Nüktelerini Aç"
                >
                  💬 Tümü
                </button>
              )}

              {/* Chat Toggle: Küçült / Büyüt Button */}
              <button
                onClick={() => setShowModeMenu(prev => !prev)}
                className={`px-2 py-1 rounded-xl text-xs font-serif-tavla font-bold flex items-center gap-1 border transition-colors ${
                  chatVisibilityMode === 'expanded'
                    ? 'bg-white/[0.08] hover:bg-white/[0.16] text-amber-200 border-white/10'
                    : chatVisibilityMode === 'notifications_only'
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                }`}
                title="Sohbet Görünümünü Değiştir (Küçült / Büyüt / Gizle)"
              >
                <span>{chatVisibilityMode === 'expanded' ? '🔽' : '🔼'}</span>
                <span className="hidden sm:inline">
                  {chatVisibilityMode === 'expanded' ? 'Küçült' : 'Büyüt'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CHAT VISIBILITY MODE SELECTION POPOVER (Floating Overlay) */}
      <AnimatePresence>
        {showModeMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowModeMenu(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute bottom-full right-2 mb-2 z-50 p-2.5 rounded-2xl bg-gradient-to-b from-[#211108]/98 via-[#180c05]/98 to-[#100703]/98 border border-amber-400/40 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl w-64 space-y-1.5"
            >
              <div className="text-[11px] font-serif-tavla font-black text-amber-300 border-b border-white/10 pb-1 flex items-center justify-between">
                <span>Sohbet Görünümü &amp; Odak</span>
                <button onClick={() => setShowModeMenu(false)} className="text-white/60 hover:text-white text-xs">✕</button>
              </div>

              <button
                onClick={() => setMode('expanded')}
                className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between border ${
                  chatVisibilityMode === 'expanded'
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 font-bold'
                    : 'bg-white/[0.03] text-white/70 border-white/5 hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <div>
                    <div className="font-bold text-white text-xs">Tam Görünüm (Açık)</div>
                    <div className="text-[10px] text-amber-200/60">Tüm sesler ve ifadeler görünür</div>
                  </div>
                </div>
                {chatVisibilityMode === 'expanded' && <span className="text-amber-400 font-bold">✓</span>}
              </button>

              <button
                onClick={() => setMode('notifications_only')}
                className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between border ${
                  chatVisibilityMode === 'notifications_only'
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 font-bold'
                    : 'bg-white/[0.03] text-white/70 border-white/5 hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🔔</span>
                  <div>
                    <div className="font-bold text-white text-xs">Sadece Bildirimler</div>
                    <div className="text-[10px] text-amber-200/60">Kutu küçülür, sadece rakip konuşmaları gelir</div>
                  </div>
                </div>
                {chatVisibilityMode === 'notifications_only' && <span className="text-amber-400 font-bold">✓</span>}
              </button>

              <button
                onClick={() => setMode('hidden')}
                className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between border ${
                  chatVisibilityMode === 'hidden'
                    ? 'bg-rose-500/20 text-rose-200 border-rose-400/40 font-bold'
                    : 'bg-white/[0.03] text-white/70 border-white/5 hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🔇</span>
                  <div>
                    <div className="font-bold text-white text-xs">Tamamen Gizli (Odak Modu)</div>
                    <div className="text-[10px] text-rose-300/60">Oyun yoğun anlarında tüm sohbeti kapat</div>
                  </div>
                </div>
                {chatVisibilityMode === 'hidden' && <span className="text-rose-400 font-bold">✓</span>}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING ALTERNATIVES POPOVER (Renders outside flow as an absolute popup, NEVER pushes layout!) */}
      <AnimatePresence>
        {showAltPopover && alternatives.length > 0 && (
          <>
            {/* Backdrop click to close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowAltPopover(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 right-0 mb-2 z-50 p-3 rounded-2xl bg-gradient-to-b from-[#1f0f08]/98 via-[#150a04]/98 to-[#0d0402]/98 border border-amber-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-2 max-h-56 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="font-serif-tavla font-black text-xs text-amber-300">
                  Alternatif Olası Hamleler ({alternatives.length})
                </span>
                <button
                  onClick={() => setShowAltPopover(false)}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5">
                {alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-400 font-mono">#{idx + 2}</span>
                      <span className="font-bold text-amber-200">
                        {alt.move.from === 'bar' ? 'Bar' : `${(alt.move.from as number) + 1}. Kapı`} →{' '}
                        {alt.move.to === 'off' ? 'Topla' : `${(alt.move.to as number) + 1}. Kapı`}
                      </span>
                      <span className="text-[11px] text-white/70 hidden sm:inline">({alt.title})</span>
                    </div>

                    {onApplyMove && (
                      <button
                        onClick={() => {
                          onApplyMove(alt);
                          setShowAltPopover(false);
                        }}
                        disabled={disabled || turn !== 'white'}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500 text-amber-200 hover:text-stone-950 text-[11px] font-bold border border-amber-400/40 transition-colors"
                      >
                        Oyna ↗
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
