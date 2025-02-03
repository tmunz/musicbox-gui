import './MenubarItem.css';
import React, { useState, forwardRef, useImperativeHandle, ReactNode } from 'react';
import { IconButton } from './IconButton';
import { IconType } from 'react-icons';
import { PiX } from 'react-icons/pi';
import { useFade } from '../utils/useFade';

export interface MenubarItemRef {
  isActive: () => boolean;
}

interface MenubarItemProps {
  icon: IconType;
  children: ReactNode;
}

export const MenubarItem = forwardRef<MenubarItemRef, MenubarItemProps>(({ children, icon: Icon }, ref) => {
  const [active, setActive] = useState(false);
  // const { visible, fadeStyle } = useFade(active, 500, 200);

  useImperativeHandle(ref, () => ({
    isActive: () => active,
  }));

  return (
    <div className='menubar-item'>
      {active && <div style={{}}>{children}</div>}
      <IconButton
        className={active ? 'close-button' : ''}
        onClick={() => setActive(b => !b)}
      >
        {active ? <PiX size={36} /> : <Icon size={36} />}
      </IconButton>
    </div>
  );
});
