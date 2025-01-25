import './Sidebar.css';
import React, { ReactNode, useState } from 'react';
import { useDimension } from '../../utils/useDimension';
import { SidebarControlButton } from './SidebarControlButton';

interface SidebarProps {
  items: {
    id: string;
    content: ReactNode;
    button: ReactNode;
  }[];
  controlGap?: number;
}

export const Sidebar = ({ items = [], controlGap = 8 }: SidebarProps) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const { height } = useDimension(elementRef) ?? { height: 0 };
  const [activeId, setActiveId] = useState<string | null>(null);

  const controlHeight = (height - (items.length - 1) * controlGap) / items.length;

  const createSetRef = (i: number) => (e: HTMLElement | null) => {
    if (i === 0) {
      /* @ts-ignore */
      elementRef.current = e;
    }
  };

  return (
    <>
      {items.map(({ id, content, button }, i) => {
        const isActiveItem = activeId === id;
        return <section key={i} ref={createSetRef(i)} className={`sidebar-tab ${isActiveItem ? 'sidebar-tab-active' : ''}`}>
          <div className='sidebar-content'>
            {content}
          </div>
          <SidebarControlButton
            className='sidebar-tab-control'
            active={isActiveItem}
            style={isActiveItem ? { height, top: 0 } : { height: controlHeight, top: i * (controlHeight + controlGap) }}
            onClick={() => setActiveId(curr => curr === id ? null : id)}
          >
            {button}
          </SidebarControlButton>
        </section>;
      })}
    </>
  );
};
