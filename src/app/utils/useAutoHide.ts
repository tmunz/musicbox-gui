import { useState, useEffect, useRef } from 'react';

export function useAutoHide(timeout: number = 3000, shouldHide: boolean = true) {
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearCurrentTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startTimeout = () => {
    clearCurrentTimeout();
    timeoutRef.current = setTimeout(() => {
      if (shouldHide) {
        setVisible(false);
      }
    }, timeout);
  };

  const handleActivity = () => {
    const now = Date.now();
    if (now - lastActivityRef.current < 100) return; 

    lastActivityRef.current = now;
    setVisible(true);
    startTimeout();
  };


  useEffect(() => {
    if (!shouldHide) {
      setVisible(true);
      clearCurrentTimeout();
    } else {
      startTimeout();
    }
  }, [shouldHide, timeout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearCurrentTimeout();
    };
  }, []);

  return visible;
}
