'use client';

import React, { useEffect, useRef, useState } from 'react';
import { appUpdater, UpdateStatus } from '@/lib/updater/appUpdater';

interface AppUpdateBannerProps {
  // Maç ortasında yeniden başlatma yapma — lobiye dönünce uygula
  canRestartNow: boolean;
}

// Hayalet (ghost) mini bildirim: lobide üstte belirir, oyunu engellemez.
export const AppUpdateBanner: React.FC<AppUpdateBannerProps> = ({ canRestartNow }) => {
  const [status, setStatus] = useState<UpdateStatus>({ phase: 'idle', percent: 0, availableVersion: '' });
  const [applying, setApplying] = useState(false);
  const canRestartRef = useRef(canRestartNow);
  canRestartRef.current = canRestartNow;

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let alive = true;

    const run = async () => {
      cleanup = await appUpdater.checkAndStart(s => {
        if (alive) setStatus(s);
      });
    };
    run();

    // Uygulama öne gelince tekrar kontrol et
    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVisible);
      cleanup?.();
    };
  }, []);

  // İndirme bitince: lobideysek hemen, maçtaysak lobiye dönünce uygula
  useEffect(() => {
    if (status.phase !== 'ready' || applying) return;
    if (!canRestartNow) return;
    setApplying(true);
    const t = setTimeout(() => {
      void appUpdater.complete();
    }, 1800);
    return () => clearTimeout(t);
  }, [status.phase, canRestartNow, applying]);

  if (status.phase === 'idle' || status.phase === 'checking' || status.phase === 'uptodate' || status.phase === 'unsupported') {
    return null;
  }

  return (
    <div className="w-full flex justify-center px-4 pt-2 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2.5 pl-3 pr-3.5 py-2 rounded-full bg-black/55 backdrop-blur-md border border-emerald-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] max-w-full">
        <span className="text-base leading-none">
          {status.phase === 'ready' ? '✅' : '🔄'}
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-emerald-200 whitespace-nowrap">
            {status.phase === 'ready'
              ? canRestartNow
                ? 'Güncelleme hazır — yeni sürüme geçiliyor…'
                : 'Güncelleme hazır — maç bitince uygulanacak'
              : `Yeni sürüm indiriliyor… %${status.percent}`}
          </div>
          {(status.phase === 'available' || status.phase === 'downloading') && (
            <div className="mt-1 h-1 w-32 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${status.percent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
