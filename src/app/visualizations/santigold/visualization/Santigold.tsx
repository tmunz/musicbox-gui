import React from 'react';
import { SampleProvider } from '../../../audio/SampleProvider';
import { Canvas } from '@react-three/fiber';
import { GlitterParticles } from './GlitterParticles';

export interface SantigoldProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
}

export const Santigold = ({ sampleProvider, canvas }: SantigoldProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <img src={require('./santigold_plain.jpg')} alt="Santigold" style={{ height: '100%' }} />
      <Canvas style={{ position: 'absolute', width: canvas.width, height: canvas.height, top: 0, left: 0 }}>
        <GlitterParticles sampleProvider={sampleProvider} />
      </Canvas>
    </div>
  );
}
