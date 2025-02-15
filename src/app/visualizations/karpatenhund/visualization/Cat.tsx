import React from 'react'
import { ShaderImage } from './shader-image/ShaderImage';

export interface CatProps {
  width: number;
  height: number;
}

export const Cat = ({ width, height }: CatProps) => {
  return <ShaderImage imageUrls={{ image: require('./karpatenhund_3_full_orig.png') }} objectFit='contain' width={width} height={height} />;
}