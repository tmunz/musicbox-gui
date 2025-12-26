import React from 'react';

interface CarouselItemProps {
  item: { id: string; component: React.ReactNode };
  isActive: boolean;
}

export const CarouselItem = React.memo(
  ({ item, isActive }: CarouselItemProps) => {
    return (
      <div className="carousel-slide" key={item.id}>
        {item.component}
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) {
      return false;
    }
    if (!nextProps.isActive) {
      return true;
    }
    return false;
  }
);
