import React from 'react';
import { Cat } from './Cat';
import { SampleProvider } from '../../../audio/SampleProvider';

export interface KarpatenhundProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
}

export const Karpatenhund = ({ sampleProvider, canvas }: KarpatenhundProps) => {
  return (
    <div style={{ background: '#fda600', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Cat width={canvas.width * 0.8} height={canvas.height * 0.8} sampleProvider={sampleProvider} />
    </div>
  );
}
