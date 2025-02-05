import { useState, useEffect, useCallback } from 'react';

export function useAutoHide(timeout: number = 3000) {
  const [visible, setVisible] = useState(true);

  const resetTimer = useCallback(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleActivity = () => {
      resetTimer();
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), timeout);
    };

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('touchstart', handleActivity);

    timer = setTimeout(() => setVisible(false), timeout);

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      clearTimeout(timer);
    };
  }, [timeout, resetTimer]);

  return visible;
}
