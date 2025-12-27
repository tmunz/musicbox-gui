import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoHide(timeout: number = 3000, condition: () => boolean = () => true) {
  const [visible, setVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conditionRef = useRef(condition);
  const lastResetTime = useRef<number>(Date.now());

  conditionRef.current = condition;

  const restartTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (conditionRef.current()) {
        setVisible(false);
      }
    }, timeout);
  }, [timeout]);

  const resetVisibility = useCallback(() => {
    const now = Date.now();
    if (now - lastResetTime.current < 100) return;

    lastResetTime.current = now;
    setVisible(true);
    restartTimeout();
  }, [restartTimeout]);

  const checkCondition = useCallback(() => {
    const shouldHide = conditionRef.current();
    if (!shouldHide && !visible) {
      setVisible(true);
    } else if (!shouldHide && visible) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    } else if (shouldHide && visible) {
      restartTimeout();
    }
  }, [visible, restartTimeout]);

  useEffect(() => {
    checkCondition();
  }, [condition, checkCondition]);

  useEffect(() => {
    const events = ['mousemove', 'pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetVisibility));

    return () => {
      events.forEach(event => window.removeEventListener(event, resetVisibility));
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [resetVisibility]);

  useEffect(() => {
    if (visible) {
      restartTimeout();
    }
  }, [visible, restartTimeout]);

  return visible;
}
