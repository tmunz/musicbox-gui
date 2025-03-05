import React from 'react';
import { SampleProvider } from '../../../audio/SampleProvider';
import { Canvas } from '@react-three/fiber';
import { GlitterParticles } from './GlitterParticles';
import { OrbitControls } from '@react-three/drei';

export interface SantigoldProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
}

export const Santigold = ({ sampleProvider, canvas }: SantigoldProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <img src={require('./santigold_plain.jpg')} alt="Santigold" style={{ height: '100%' }} />
      <Canvas style={{ position: 'absolute', width: canvas.width, height: canvas.height, top: 0, left: 0 }}>
        <orthographicCamera position={[0, 0, 10]} zoom={1} />
        <OrbitControls enabled={true} />
        <GlitterParticles sampleProvider={sampleProvider} />
      </Canvas>
    </div>
  );
}
