import React from 'react';
import { SampleProvider } from '../../../audio/SampleProvider';
import { Scene } from './Scene';

export interface TheRiddleProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
}

export const TheRiddle = ({ sampleProvider, canvas }: TheRiddleProps) => {
  const sizeRatio = 1.0;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Scene 
        width={canvas.width * sizeRatio}
        height={canvas.height * sizeRatio}
        sampleProvider={sampleProvider}
      />
    </div>
  );
};
