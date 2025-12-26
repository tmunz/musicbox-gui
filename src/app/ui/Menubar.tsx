import './Menubar.css';
import React, { useRef, HTMLAttributes } from 'react';
import { useAutoHide } from '../utils/useAutoHide';
import { MenubarItemRef } from './MenubarItem';

interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
  hideTimeout: number;
}

export const Menubar = ({ hideTimeout, children }: MenubarProps) => {
  const childRefs = useRef<(MenubarItemRef | null)[]>([]);
  const visible = useAutoHide(hideTimeout, () => !childRefs.current.some(ref => ref?.isActive?.() === true));

  return (
    <div className={`menubar ${visible ? 'visible' : 'hidden'}`}>
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              ref: (el: MenubarItemRef | null) => (childRefs.current[index] = el),
            })
          : child
      )}
    </div>
  );
};
