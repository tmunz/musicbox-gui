import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Points } from 'three';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useMatcapTexture } from '@react-three/drei';

export interface GlitterParticlesProps {
  sampleProvider: SampleProvider;
  count?: number;
}

export const GlitterParticles = ({ sampleProvider, count = 10 }: GlitterParticlesProps) => {
  const pointsRef = useRef<Points | null>(null);
  const { current: glitterTexture } = useRef(useMatcapTexture("422509_C89536_824512_0A0604"));

  const particles = useMemo(() => {
    return new Float32Array(sampleProvider.sampleSize * sampleProvider.frequencyBands * count * 3);
  }, [sampleProvider.sampleSize, sampleProvider.frequencyBands]);

  const shapeFactor = ([x, y]: number[], k: number): number[] => {
    const xx = x * 2 - 1;
    const yy = y * 2 - 1;
    const bow = -Math.pow(y, 3) * 3;
    const width = (0.3 - y) * x - xx * (yy - 1) * 0.3;
    const circle = xx * Math.pow(1 - yy * yy, 0.5);
    const x0 = bow + circle + width;
    const v = Math.sin(k * Math.PI) * 0.1;
    return [x0 + 2 + v, yy * 2.4 + 1, k * yy * circle * 0.3];
  }

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = -Math.PI / 8; 
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < sampleProvider.sampleSize; i++) {
        for (let j = 0; j < sampleProvider.frequencyBands; j++) {
          const sampleValue = sampleProvider.get(i)[j] / 255;
          for (let k = 0; k < count; k++) {
            const [x, y, z] = shapeFactor([i / sampleProvider.sampleSize, j / sampleProvider.frequencyBands], k);
            const index = ((i * sampleProvider.frequencyBands * count) + (j * count) + k) * 3;
            positions[index] = x;
            positions[index + 1] = y - sampleValue;	
            positions[index + 2] = z * sampleValue;
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
      <pointsMaterial
        size={0.3}
        transparent={true}
        depthWrite={false}
        alphaMap={glitterTexture[0]}
        blending={AdditiveBlending}
        color="#999"
        map={glitterTexture[0]}
      />
    </points>
  );
};