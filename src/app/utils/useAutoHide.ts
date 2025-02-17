import { useState, useEffect, useRef } from 'react';

export function useAutoHide(timeout: number = 3000, condition: () => boolean = () => true) {
  const [visible, setVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const restartTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (condition()) {
        setVisible(false);
      }
    }, timeout);
  };

  const resetVisibility = () => {
    setVisible(true);
    restartTimeout();
  };

  useEffect(() => {
    const events = ['mousemove', 'pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetVisibility));

    return () => {
      events.forEach(event => window.removeEventListener(event, resetVisibility));
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [timeout]);

  useEffect(() => {
    if (visible) {
      restartTimeout();
    }
  }, [visible]);

  return visible;
}
