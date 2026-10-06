'use client';

import { useState, useCallback } from 'react';

// Ortak bildirim kancası: tek API, her yerde aynı davranış.
// Örn: const { msg, show } = useToast();
export function useToast(durationMs: number = 2200) {
  const [msg, setMsg] = useState<string>('');
  const show = useCallback(
    (m: string) => {
      setMsg(m);
      setTimeout(() => {
        setMsg(prev => (prev === m ? '' : prev));
      }, durationMs);
    },
    [durationMs]
  );
  const clear = useCallback(() => setMsg(''), []);
  return { msg, show, clear };
}
