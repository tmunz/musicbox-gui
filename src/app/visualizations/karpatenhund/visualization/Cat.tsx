import React from 'react'
import { ShaderImage } from './shader-image/ShaderImage';
import { ObjectFit } from './shader-image/ShaderImageUtils';

export interface CatProps {
  width: number;
  height: number;
}

export const Cat = ({ width, height }: CatProps) => {
  return <ShaderImage imageUrls={{ image: require('./karpatenhund_3_full_orig.png') }} objectFit={ObjectFit.CONTAIN} width={width} height={height} />;
}