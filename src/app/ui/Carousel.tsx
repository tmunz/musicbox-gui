import './Carousel.css';
import React, { useEffect, useRef, useState } from 'react';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { IconButton } from './IconButton';
import { useAutoHide } from '../utils/useAutoHide';

interface CarouselProps {
  items: { id: string; component: React.ReactNode }[];
  onSelect: (id: string) => void;
  selectedId?: string;
  defaultFocus?: boolean
}

export const Carousel = ({ items, onSelect, selectedId, defaultFocus = false }: CarouselProps) => {
  const index = items.findIndex((item) => item.id === selectedId);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const visible = useAutoHide();


  const next = () => {
    const nextIndex = (index + 1) % items.length;
    onSelect(items[nextIndex].id);
  };

  const prev = () => {
    const prevIndex = (index - 1 + items.length) % items.length;
    onSelect(items[prevIndex].id);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement === carouselRef.current) {
        if (event.key === 'ArrowRight') next();
        if (event.key === 'ArrowLeft') prev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [index]);

  useEffect(() => {
    let startX = 0;
    let lastX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      lastX = startX;
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentX = e.touches[0].clientX;
      setDragOffset(currentX - startX);
      lastX = currentX;
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      const deltaX = lastX - startX;

      if (deltaX < -50) next();
      else if (deltaX > 50) prev();
      setDragOffset(0);
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('touchstart', handleTouchStart);
      carousel.addEventListener('touchmove', handleTouchMove);
      carousel.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener('touchstart', handleTouchStart);
        carousel.removeEventListener('touchmove', handleTouchMove);
        carousel.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [index]);

  return (
    <div className='carousel' ref={carouselRef} tabIndex={defaultFocus ? 0 : undefined}>
      <div
        className='carousel-track'
        style={{
          transform: `translateX(calc(${-index * 100}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.5s ease-in-out',
        }}
      >
        {items.map((item) => (
          <div className='carousel-slide' key={item.id}>
            {item.component}
          </div>
        ))}
      </div>

      <IconButton className={`carousel-btn prev ${visible ? '' : 'carousel-btn-hidden'}`} onClick={prev} title='Previous'>
        <PiCaretLeft size={48} />
      </IconButton>

      <IconButton className={`carousel-btn next ${visible ? '' : 'carousel-btn-hidden'}`} onClick={next} title='Next'>
        <PiCaretRight size={48} />
      </IconButton>
    </div>
  );
};

