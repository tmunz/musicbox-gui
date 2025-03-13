import React from 'react';
import { SampleProvider } from '../../../audio/SampleProvider';
import { Bedroom } from './Bedroom';

export interface PushTheSkyAwayProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
}

export const PushTheSkyAway = ({ sampleProvider, canvas }: PushTheSkyAwayProps) => {
  const sizeRatio = 0.9;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Bedroom width={canvas.width * sizeRatio} height={canvas.height * sizeRatio} sampleProvider={sampleProvider} />
    </div>
  );
}
