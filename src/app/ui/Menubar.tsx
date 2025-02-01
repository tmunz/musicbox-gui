import './Menubar.css';
import React, { useEffect, useState, HTMLAttributes } from 'react';

interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
  hideTimeout: number;
}

export const Menubar = ({ hideTimeout, children }: MenubarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimeout = () => {
      setVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setVisible(false), hideTimeout);
    };

    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keydown', resetTimeout);

    timeout = setTimeout(() => setVisible(false), hideTimeout);

    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keydown', resetTimeout);
      clearTimeout(timeout);
    };
  }, [hideTimeout]);

  return (
    <div className={`menubar ${visible ? 'visible' : 'hidden'}`}>
      {children}
    </div>
  );
};
