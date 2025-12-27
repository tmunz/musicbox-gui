import './Menubar.css';
import React, { HTMLAttributes, useState, useCallback } from 'react';
import { useAutoHide } from '../../utils/useAutoHide';

interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
  hideTimeout: number;
}

export const Menubar = ({ hideTimeout, children }: MenubarProps) => {
  const [activeItems, setActiveItems] = useState<Set<number>>(new Set());
  const visible = useAutoHide(hideTimeout, () => activeItems.size === 0);

  const updateActiveState = useCallback((index: number, isActive: boolean) => {
    setActiveItems(prev => {
      const newSet = new Set(prev);
      if (isActive) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  }, []);

  return (
    <div className={`menubar ${visible ? 'visible' : 'hidden'}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          ...child.props,
          onActiveChange: (isActive: boolean) => updateActiveState(index, isActive),
        });
      })}
    </div>
  );
};
