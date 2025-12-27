import './MenubarItem.css';
import { useState, useRef, forwardRef, useImperativeHandle, ReactNode, ComponentType, useEffect } from 'react';
import { IconButton } from '../icon-button/IconButton';
import { IconBaseProps } from 'react-icons';
import { PiX } from 'react-icons/pi';

export interface CollapsibleMenubarItemRef {
  isActive: () => boolean;
}

interface CollapsibleMenubarItemProps {
  icon: ComponentType<IconBaseProps>;
  children: ReactNode;
}

export const CollapsibleMenubarItem = forwardRef<CollapsibleMenubarItemRef, CollapsibleMenubarItemProps>(({ children, icon: Icon }, ref) => {
  const [active, setActive] = useState(false);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    isActive: () => active,
  }));

  useEffect(() => {
    if (!active || !contentRef.current || !wrapperRef.current) return;

    const element = contentRef.current;
    const wrapper = wrapperRef.current;

    if (measuredWidth === null) {
      element.style.width = 'auto';
      element.style.position = 'absolute';
      element.style.visibility = 'hidden';
      
      const width = wrapper.offsetWidth;
      setMeasuredWidth(width);
      
      element.style.position = '';
      element.style.visibility = '';
      element.style.width = '0px';
      
      requestAnimationFrame(() => {
        element.style.width = `${width}px`;
      });
    } else {
      // Subsequent times: use cached width
      element.style.width = `${measuredWidth}px`;
    }
  }, [active, measuredWidth]);

  return (
    <div className="collapsible-menubar-item">
      <div 
        ref={contentRef}
        className={`menu-item-content ${active ? '' : 'menu-item-content-hidden'}`}
      >
        <div ref={wrapperRef} className="menu-item-content-wrapper">
          {children}
        </div>
      </div>
      <IconButton className={active ? 'menu-active' : ''} onClick={() => setActive(b => !b)}>
        <PiX size={36} className="icon-fade" />
        <Icon size={36} className="icon-fade" />
      </IconButton>
    </div>
  );
});
