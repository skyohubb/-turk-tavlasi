'use client';

// Hafif Mod: düşük donanımlı telefonlarda blur/gölge/animasyon yükünü kısar.
// documentElement'e `perf-lite` sınıfı takılır, globals.css bunu uygular.

const KEY = 'duses_lite_mode';

export function getLiteMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setLiteMode(on: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    // sessiz geç
  }
  applyLiteMode(on);
}

export function applyLiteMode(on: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('perf-lite', on);
}
