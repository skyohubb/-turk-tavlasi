// Ortak sayı biçimleyiciler (dar ekranda taşmayı önler)

export function formatCoins(n: number): string {
  if (n >= 10000) {
    return `${(n / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}K`;
  }
  return n.toLocaleString('tr-TR');
}

export function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Uzun bekleme süreleri için (lobi ikram sayacı): "2 sa 5 dk" / "3 dk 12 sn"
export function formatLongDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h} sa ${m} dk`;
  return `${m} dk ${s} sn`;
}
