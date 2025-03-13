import React from 'react';
import { MoonLightScene } from './MoonLightScene';
import { SampleProvider } from '../../../audio/SampleProvider';

export interface CrisesProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
}

export const Crises = ({ sampleProvider, canvas }: CrisesProps) => {
  const sizeRatio = 0.8;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <MoonLightScene width={canvas.width * sizeRatio} height={canvas.height * sizeRatio} sampleProvider={sampleProvider} />
    </div>
  );
}
