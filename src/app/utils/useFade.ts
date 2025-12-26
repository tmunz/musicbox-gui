import { useEffect, useRef, useState } from 'react';

export const useFade = (active: boolean, duration = 500, delay = 0) => {
  const RENDER_DELY = 100;
  const [visible, setVisible] = useState(active);
  const [opacity, setOpacity] = useState(active ? 1 : 0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setOpacity(0);
      timeoutRef.current = setTimeout(() => setOpacity(1), RENDER_DELY);
    } else {
      setOpacity(0);
      timeoutRef.current = setTimeout(() => setVisible(false), Math.max(0, duration - RENDER_DELY));
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [active, duration]);

  const fadeStyle = {
    opacity,
    visible: opacity > 0 ? 'visible' : 'hidden',
    transition: `opacity ${duration}ms ease-in-out`,
  };

  return { visible, fadeStyle };
};
