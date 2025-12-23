import React from 'react';
import { SampleProvider } from '../../../audio/SampleProvider';
import { GameVisualization } from './GameVisualization';

export interface GameProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
}

export const Game = ({ sampleProvider, canvas }: GameProps) => {
  const sizeRatio = 1.0;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <GameVisualization 
        width={canvas.width * sizeRatio}
        height={canvas.height * sizeRatio}
        sampleProvider={sampleProvider}
      />
    </div>
  );
};
