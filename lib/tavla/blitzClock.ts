'use client';

// Blitz (15sn) geri sayım saati — harici mini-store.
// Amaç: her saniye tüm TavlaBoard'u yeniden çizmek yerine SADECE rozet
// bileşenleri abone olur ve saniyede bir onlar tazelenir (kasma önler).

import { useSyncExternalStore } from 'react';
import { soundEffects } from '@/lib/audio/soundEffects';

type Listener = () => void;
type Turn = 'white' | 'black';

const BLITZ_SECONDS = 15;

class BlitzClock {
  private seconds: number = BLITZ_SECONDS;
  private turn: Turn = 'white';
  private listeners: Set<Listener> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;
  private expireCb: (() => void) | null = null;

  public subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };

  public getSnapshot = (): number => this.seconds;

  public getServerSnapshot = (): number => BLITZ_SECONDS;

  private emit(): void {
    this.listeners.forEach(l => l());
  }

  public setTurn(turn: Turn): void {
    this.turn = turn;
  }

  public reset(): void {
    this.seconds = BLITZ_SECONDS;
    this.emit();
  }

  public addBonus(extra: number): void {
    this.seconds = Math.min(BLITZ_SECONDS, this.seconds + extra);
    this.emit();
  }

  public onExpire(cb: (() => void) | null): void {
    this.expireCb = cb;
  }

  public start(): void {
    this.stop();
    this.timer = setInterval(() => {
      if (this.seconds <= 1) {
        this.seconds = 0;
        this.emit();
        this.expireCb?.();
        return;
      }
      this.seconds -= 1;
      // Son 6 saniyede sadece beyazın sırasında uyarı sesi
      if (this.seconds <= 6 && this.turn === 'white') {
        try {
          soundEffects.playCheckerDrop();
        } catch {
          // sessiz geç
        }
      }
      this.emit();
    }, 1000);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const blitzClock = new BlitzClock();

export function useBlitzSeconds(): number {
  return useSyncExternalStore(
    blitzClock.subscribe,
    blitzClock.getSnapshot,
    blitzClock.getServerSnapshot
  );
}
