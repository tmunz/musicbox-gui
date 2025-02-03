import { useEffect, useRef, useState } from "react";

export const useFade = (active: boolean, duration: number = 500, delay: number = 0) => {
  const [visible, setVisible] = useState(active);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => setVisible(active), active ? delay : duration);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [active]);

  const fadeStyle = {
    opacity: visible ? 1 : 0,
    transition: `opacity ${duration}ms ease-in-out`,
  }

  return { visible, fadeStyle };
}