import { useEffect, useRef, useState } from 'react';

export function useElapsed(active: boolean): number {
  const [elapsed, setElapsed] = useState(0);
  const lastStartRef = useRef<number | null>(active ? Date.now() : null);
  const frozenElapsedRef = useRef<number>(0);

  useEffect(() => {
    let raf: number | undefined;

    function update() {
      if (active && lastStartRef.current !== null) {
        const now = Date.now();
        const newElapsed = frozenElapsedRef.current + (now - lastStartRef.current) / 1000;
        setElapsed(newElapsed);
        raf = requestAnimationFrame(update);
      }
    }

    if (active) {
      lastStartRef.current = Date.now();
      raf = requestAnimationFrame(update);
    } else {
      if (lastStartRef.current !== null) {
        const now = Date.now();
        frozenElapsedRef.current += (now - lastStartRef.current) / 1000;
        setElapsed(frozenElapsedRef.current);
        lastStartRef.current = null;
      }
    }

    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, [active]);

  return elapsed;
}
