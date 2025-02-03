import './Menubar.css';
import React, { useEffect, useState, useRef, HTMLAttributes } from 'react';

interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
  hideTimeout: number;
}

export const Menubar = ({ hideTimeout, children }: MenubarProps) => {
  const [visible, setVisible] = useState(false);
  const childRefs = useRef<{ isActive?: () => boolean; }[]>([]);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const restartTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (!childRefs.current.some((ref) => ref?.isActive?.() === true)) {
        setVisible(false);
      }
    }, hideTimeout);
  };

  const resetVisibility = () => {
    setVisible(true);
    restartTimeout();
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetVisibility);
    window.addEventListener('keydown', resetVisibility);

    return () => {
      window.removeEventListener('mousemove', resetVisibility);
      window.removeEventListener('keydown', resetVisibility);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [hideTimeout]);

  useEffect(() => {
    if (visible) {
      restartTimeout();
    }
  }, [visible]);

  return (
    <div className={`menubar ${visible ? 'visible' : 'hidden'}`}>
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { ref: (el: any) => (childRefs.current[index] = el) })
          : child
      )}
    </div>
  );
};
