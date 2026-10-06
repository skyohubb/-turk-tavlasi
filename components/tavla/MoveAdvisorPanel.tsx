'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoveAdvice } from '@/lib/tavla/moveAdvisor';

interface MoveAdvisorPanelProps {
  advice: MoveAdvice | null;
  alternatives: MoveAdvice[];
  isEnabled: boolean;
  onToggleEnabled: () => void;
  onApplyMove?: (advice: MoveAdvice) => void;
  isBlitz?: boolean;
  masterStreak?: number; // 0..3
  disabled?: boolean;
}

export const MoveAdvisorPanel: React.FC<MoveAdvisorPanelProps> = ({
  advice,
  alternatives,
  isEnabled,
  onToggleEnabled,
  onApplyMove,
  isBlitz = false,
  masterStreak = 0,
  disabled = false,
}) => {
  const [showAlternatives, setShowAlternatives] = useState<boolean>(false);

  const getCategoryBadge = (category: MoveAdvice['category']) => {
    switch (category) {
      case 'kapi_alma':
        return { label: '🏰 Kapı Kurma', bg: 'bg-amber-500/20 text-amber-300 border-amber-400/40' };
      case 'kirma':
        return { label: '⚔️ Açık Kırma', bg: 'bg-rose-500/20 text-rose-300 border-rose-400/40' };
      case 'toplama':
        return { label: '🏆 Pul Toplama', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' };
      case 'kacis':
        return { label: '🏃 Kaçış', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' };
      default:
        return { label: '🛡️ Güvenli İlerleme', bg: 'bg-stone-500/20 text-stone-300 border-stone-400/40' };
    }
  };

  return (
    <div className="w-full select-none transition-all duration-300">
      <div className="relative rounded-2xl bg-gradient-to-r from-[#211108]/90 via-[#180c05]/95 to-[#120703]/90 border border-amber-400/40 shadow-[0_4px_24px_rgba(0,0,0,0.65)] backdrop-blur-2xl p-2.5 sm:px-4 sm:py-3 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-10 left-1/3 w-40 h-10 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
              isEnabled ? 'bg-amber-400 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-white/10 text-white/50'
            }`}>
              💡
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif-tavla font-black text-xs sm:text-sm text-[#fef3c7]">
                Usta Hamle Danışmanı
              </span>
              <span className="text-[10px] text-amber-300/80 font-mono hidden sm:inline">
                (Pozisyon &amp; Taktik Analizi)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Master Streak Progress */}
            {isEnabled && (
              <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30 text-[10px]">
                <span className="text-amber-300 font-bold">⚡ Usta Serisi:</span>
                <span className="font-mono text-white font-bold">{masterStreak}/3</span>
                <span className="text-[9px] text-amber-200/60 hidden md:inline">
                  (Ödül: +1 Zar Hakkı)
                </span>
              </div>
            )}

            {/* Enable/Disable Toggle Switch */}
            <button
              onClick={onToggleEnabled}
              className={`px-3 py-1 rounded-full text-xs font-serif-tavla font-bold flex items-center gap-1.5 border transition-all duration-200 active:scale-95 ${
                isEnabled
                  ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-white/[0.08] text-white/60 border-white/10 hover:text-white'
              }`}
              title={isEnabled ? 'Usta tavsiyelerini gizle' : 'Usta tavsiyelerini etkinleştir'}
            >
              <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-stone-950 animate-ping' : 'bg-white/40'}`} />
              <span>{isEnabled ? 'Açık' : 'Kapalı'}</span>
            </button>
          </div>
        </div>

        {/* Content Section (Rendered when Enabled) */}
        <AnimatePresence>
          {isEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-2.5 pt-2 border-t border-white/[0.08]"
            >
              {advice ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.07]">
                    {/* Advice Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Category badge */}
                        {(() => {
                          const cat = getCategoryBadge(advice.category);
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.bg}`}>
                              {cat.label}
                            </span>
                          );
                        })()}

                        {/* Move notation */}
                        <span className="font-serif-tavla font-black text-xs sm:text-sm text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-400/40">
                          {advice.move.from === 'bar' ? 'Bar (Kırık)' : `${(advice.move.from as number) + 1}. Kapı`}{' '}
                          →{' '}
                          {advice.move.to === 'off' ? 'Topla (Dışarı)' : `${(advice.move.to as number) + 1}. Kapı`}
                        </span>

                        <span className="text-[11px] font-mono font-bold text-white bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                          🎲 Zar: {advice.move.dieValue}
                        </span>

                        {isBlitz && (
                          <span className="text-[10px] font-bold text-rose-300 bg-rose-500/25 px-2 py-0.5 rounded-full border border-rose-400/40 animate-pulse">
                            ⚡ +3s Süre Bonusu
                          </span>
                        )}
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-[#fef3c7]/90 leading-relaxed font-medium">
                        <strong className="text-amber-300">{advice.title}: </strong>
                        {advice.reason}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-amber-200/70 pt-0.5">
                        <span>🛡️ Risk Oranı: <strong className={advice.riskPercent === 0 ? 'text-emerald-400 font-bold' : 'text-amber-300'}>%{advice.riskPercent} ({advice.riskPercent === 0 ? 'Tam Emniyet' : 'Taktik Risk'})</strong></span>
                        <span>·</span>
                        <span>🎁 Ödül: <strong className="text-amber-300 font-bold">{advice.rewardSummary}</strong></span>
                      </div>
                    </div>

                    {/* Quick Apply Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {alternatives.length > 0 && (
                        <button
                          onClick={() => setShowAlternatives(prev => !prev)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-amber-200 text-xs font-semibold border border-white/10 transition-colors"
                          title="Alternatif olası hamleleri gör"
                        >
                          {showAlternatives ? 'Kapat ▲' : `Alternatifler (${alternatives.length}) ▼`}
                        </button>
                      )}

                      {onApplyMove && (
                        <button
                          onClick={() => onApplyMove(advice)}
                          disabled={disabled}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-serif-tavla font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-300 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <span>✨</span>
                          <span>Hamleyi Oyna</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Alternatives List */}
                  {showAlternatives && alternatives.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-2 space-y-1.5 pl-2 border-l-2 border-amber-400/40"
                    >
                      <span className="text-[10px] uppercase font-bold text-amber-300/80 block">
                        Diğer Olası Hamle Seçenekleri:
                      </span>
                      {alternatives.map((alt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-stone-400 font-mono">#{idx + 2}</span>
                            <span className="font-bold text-amber-200">
                              {alt.move.from === 'bar' ? 'Bar' : `${(alt.move.from as number) + 1}. Kapı`} →{' '}
                              {alt.move.to === 'off' ? 'Topla' : `${(alt.move.to as number) + 1}. Kapı`}
                            </span>
                            <span className="text-[11px] text-white/70">({alt.title})</span>
                          </div>

                          {onApplyMove && (
                            <button
                              onClick={() => onApplyMove(alt)}
                              disabled={disabled}
                              className="px-2 py-0.5 rounded bg-white/[0.08] hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold border border-white/10"
                            >
                              Oyna ↗
                            </button>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-1 text-xs text-amber-200/50">
                  <span>🎲 Zarları attıktan sonra en iyi hamle analizi burada görüntülenecektir.</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
