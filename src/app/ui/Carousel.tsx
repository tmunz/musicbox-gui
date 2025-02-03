import './Carousel.css';
import React, { useEffect, useRef } from 'react';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { IconButton } from './IconButton';

interface CarouselProps {
  items: { id: string; component: React.ReactNode }[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

const Carousel = ({ items, onSelect, selectedId }: CarouselProps) => {
  const index = items.findIndex((item) => item.id === selectedId);
  const carouselRef = useRef<HTMLDivElement>(null);

  const next = () => {
    const nextIndex = (index + 1) % items.length;
    onSelect(items[nextIndex].id);
  };

  const prev = () => {
    const nextIndex = (index - 1 + items.length) % items.length;
    onSelect(items[nextIndex].id);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') prev();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  useEffect(() => {
    let startX = 0;
    let endX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      endX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const deltaX = startX - endX;
      if (deltaX > 50) next();
      if (deltaX < -50) prev();
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
    <div className="carousel" ref={carouselRef}>
      <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {items.map((item) => (
          <div className="carousel-slide" key={item.id}>
            {item.component}
          </div>
        ))}
      </div>

      <IconButton className="carousel-btn prev" onClick={prev} title="Previous">
        <PiCaretLeft size={48} />
      </IconButton>

      <IconButton className="carousel-btn next" onClick={next} title="Next">
        <PiCaretRight size={48} />
      </IconButton>
    </div>
  );
};

export default Carousel;
