'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Ortak bildirim kancası: tek API, her yerde aynı davranış.
// Örn: const { msg, show } = useToast();
export function useToast(durationMs: number = 2200) {
  const [msg, setMsg] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const show = useCallback(
    (m: string) => {
      // Hızlı ard arda çağrılarda eski timer yeni mesajı silmesin
      if (timerRef.current) clearTimeout(timerRef.current);
      setMsg(m);
      timerRef.current = setTimeout(() => {
        setMsg(prev => (prev === m ? '' : prev));
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs]
  );
  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsg('');
  }, []);
  return { msg, show, clear };
}
