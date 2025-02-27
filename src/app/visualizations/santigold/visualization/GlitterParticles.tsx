import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import { SampleProvider } from '../../../audio/SampleProvider';

export interface GlitterParticlesProps {
  sampleProvider: SampleProvider;
}

export const GlitterParticles = ({ sampleProvider }: GlitterParticlesProps) => {
  const pointsRef = useRef<Points | null>(null);

  const particles = useMemo(() => {
    return new Float32Array(sampleProvider.sampleSize * sampleProvider.frequencyBands * 3);
  }, [sampleProvider.sampleSize, sampleProvider.frequencyBands]);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < sampleProvider.sampleSize; i++) {
        for (let j = 0; j < sampleProvider.frequencyBands; j++) {
          const sampleValue = sampleProvider.get(i)[j] / 255;
          const x = i / sampleProvider.sampleSize * 2 - 1 + sampleValue;
          const y = j / sampleProvider.frequencyBands * 2 - 1;
          const index = (i * sampleProvider.frequencyBands + j) * 3;
          positions[index] = x * 2;
          positions[index + 1] = y * 2;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles}
          count={particles.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="gold" />
    </points>
  );
};