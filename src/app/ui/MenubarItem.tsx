import './MenubarItem.css';
import React, { useState, forwardRef, useImperativeHandle, ReactNode, ComponentType } from 'react';
import { IconButton } from './IconButton';
import { IconBaseProps } from 'react-icons';
import { PiX } from 'react-icons/pi';

export interface MenubarItemRef {
  isActive: () => boolean;
}

interface MenubarItemProps {
  icon: ComponentType<IconBaseProps>;
  children: ReactNode;
}

export const MenubarItem = forwardRef<MenubarItemRef, MenubarItemProps>(({ children, icon: Icon }, ref) => {
  const [active, setActive] = useState(false);

  useImperativeHandle(ref, () => ({
    isActive: () => active,
  }));

  return (
    <div className='menubar-item'>
      <div className={`menu-item-content ${active ? '' : 'menu-item-content-hidden'}`}>{children}</div>
      <IconButton
        className={active ? 'close-button' : ''}
        onClick={() => setActive(b => !b)}
      >
        {active ? <PiX size={36} /> : <Icon size={36} />}
      </IconButton>
    </div>
  );
});
