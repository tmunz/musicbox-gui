import React from 'react';
import { SampleProvider } from '../../../audio/SampleProvider';

export interface SantigoldProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
}

export const Santigold = ({ sampleProvider, canvas }: SantigoldProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <img src={require('./santigold_plain.jpg')} alt="Santigold" style={{ height: '100%' }} />
      coming soon
    </div>
  );
}
