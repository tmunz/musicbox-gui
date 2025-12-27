import './CollapsibleMenubarItem.css';
import { useState, useRef, ReactNode, ComponentType, useEffect } from 'react';
import { IconBaseProps } from 'react-icons';
import { PiX } from 'react-icons/pi';
import { COLLAPSIBLE_MENUBAR_ITEM_TRANSITION_DURATION_MS } from './MenubarConstants';
import { IconToggleButton } from '../icon-button/IconToggleButton';

interface CollapsibleMenubarItemProps {
  icon: ComponentType<IconBaseProps>;
  children: ReactNode;
  onActiveChange?: (isActive: boolean) => void;
}

export const CollapsibleMenubarItem = ({ children, icon: Icon, onActiveChange }: CollapsibleMenubarItemProps) => {
  const [active, setActive] = useState(false);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  useEffect(() => {
    if (!contentRef.current || !wrapperRef.current) return;

    const element = contentRef.current;
    const wrapper = wrapperRef.current;

    if (active) {
      if (measuredWidth === null) {
        wrapper.style.width = 'auto';
        element.style.width = 'auto';
        element.style.position = 'absolute';
        element.style.visibility = 'hidden';

        const width = wrapper.scrollWidth;
        setMeasuredWidth(width);

        element.style.position = '';
        element.style.visibility = '';
        element.style.width = '0px';
        wrapper.style.width = `${width}px`;

        requestAnimationFrame(() => {
          element.style.width = `${width}px`;
        });
      } else {
        wrapper.style.width = `${measuredWidth}px`;
        element.style.width = `${measuredWidth}px`;
      }
    } else if (measuredWidth !== null) {
      element.style.width = '0px';

      setTimeout(() => {
        if (wrapperRef.current) {
          wrapperRef.current.style.width = '';
          setMeasuredWidth(null);
        }
      }, COLLAPSIBLE_MENUBAR_ITEM_TRANSITION_DURATION_MS);
    }
  }, [active, measuredWidth]);

  return (
    <div className="collapsible-menubar-item">
      <div ref={contentRef} className={`menu-item-content ${active ? '' : 'menu-item-content-hidden'}`}>
        <div ref={wrapperRef} className="menu-item-content-wrapper">
          {children}
        </div>
      </div>
      <IconToggleButton activeIcon={PiX} inactiveIcon={Icon} isActive={active} onClick={() => setActive(b => !b)} />
    </div>
  );
};
