import './Menubar.css';
import React, { useRef, HTMLAttributes } from 'react';
import { useAutoHide } from '../utils/useAutoHide';

interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
  hideTimeout: number;
}

export const Menubar = ({ hideTimeout, children }: MenubarProps) => {
  const childRefs = useRef<{ isActive?: () => boolean; }[]>([]);
  const visible = useAutoHide(hideTimeout, () => !childRefs.current.some((ref) => ref?.isActive?.() === true));

  return (
    <div className={`menubar ${visible ? 'visible' : 'hidden'}`}>
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { ref: (el: any) => (childRefs.current[index] = el) } as any)
          : child
      )}
    </div>
  );
};
