import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import { SampleProvider } from '../../../audio/SampleProvider';

export interface GlitterParticlesProps {
  sampleProvider: SampleProvider;
  count?: number;
}

export const GlitterParticles = ({ sampleProvider, count = 1 }: GlitterParticlesProps) => {
  const pointsRef = useRef<Points | null>(null);

  const particles = useMemo(() => {
    return new Float32Array(sampleProvider.sampleSize * sampleProvider.frequencyBands * count * 3);
  }, [sampleProvider.sampleSize, sampleProvider.frequencyBands]);

  const shapeFactor = ([x, y]: number[]): number[] => {
    const xn = (x + 1) * 0.5;
    const yn = (y + 1) * 0.5;
    const bow = -Math.pow(yn, 3) * 3; //+ Math.pow((1 - y) * 2, 2) * 0.1;
    const width = (0.3 - yn) * xn - x * (y - 1) * 0.3;
    const circle = x * Math.pow(1 - y * y, 0.5);
    const x0 = bow + circle + width;
    return [x0 + 2.1, y * 2.6 + 0.5];
  }

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < sampleProvider.sampleSize; i++) {
        for (let j = 0; j < sampleProvider.frequencyBands; j++) {
          const sampleValue = sampleProvider.get(i)[j] / 255;
          const [x, y] = shapeFactor([i / sampleProvider.sampleSize, j / sampleProvider.frequencyBands].map(v => v * 2 - 1));
          for (let k = 0; k < count; k++) {
            const index = ((i * sampleProvider.frequencyBands * count) + (j * count) + k) * 3;
            positions[index] = x + Math.sin(sampleValue + k) * 0.1;
            positions[index + 1] = y + Math.cos(sampleValue + k) * 0.1;
            positions[index + 2] = k * 0.1;
          }
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