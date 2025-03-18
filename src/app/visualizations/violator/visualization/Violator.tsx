import React from 'react';
import { Rose } from './Rose';
import { SampleProvider } from '../../../audio/SampleProvider';

export interface ViolatorProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
}

export const Violator = ({ sampleProvider, canvas }: ViolatorProps) => {
  const sizeRatio = 0.8;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Rose width={canvas.width * sizeRatio} height={canvas.height * sizeRatio} sampleProvider={sampleProvider} />
    </div>
  );
}
