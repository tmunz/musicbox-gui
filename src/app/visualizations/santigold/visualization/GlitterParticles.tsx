import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import { SampleProvider } from '../../../audio/SampleProvider';
import { Box, useMatcapTexture } from '@react-three/drei';

export interface GlitterParticlesProps {
  sampleProvider: SampleProvider;
  count?: number;
}

export const GlitterParticles = ({ sampleProvider, count = 3 }: GlitterParticlesProps) => {
  const pointsRef = useRef<Points | null>(null);
  const { current: glitterTexture } = useRef(useMatcapTexture("422509_C89536_824512_0A0604"));

  const particles = useMemo(() => {
    return new Float32Array(sampleProvider.sampleSize * sampleProvider.frequencyBands * count * 3);
  }, [sampleProvider.sampleSize, sampleProvider.frequencyBands]);


  // [0, 1]
  const shapeFactor = (x: number, y: number, k: number): number[] => {
    const xn = x * 2 - 1;
    const yn = y * 2 - 1;
    const bow = -Math.pow(y, 3) * 2;
    const width = (0.3 - y) * x - xn * (yn - 1) * 0.3;
    const circle = xn * Math.pow(1 - yn * yn, 0.5);
    // const v = Math.sin(k * Math.PI) * 0.1;
    // return [x0 + 2 + v, yy * 2.4 + 1, k * yy * circle * 0.3];
    const x0 = x + (bow + circle + width);
    return [x0 + 2, yn * 2.2 - 0.5, k * 2 - 1];
  }

  useFrame(() => {
    if (pointsRef.current) {
      // pointsRef.current.rotation.y = -Math.PI / 8; 
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < sampleProvider.frequencyBands; i++) {
        for (let j = 0; j < sampleProvider.sampleSize; j++) {
          const sampleValue = sampleProvider.get(j)[i] / 255;
          for (let k = 0; k < count; k++) {
            const a = i / sampleProvider.frequencyBands;
            const b = 1 - j / sampleProvider.sampleSize;
            const c = k / count;
            const [x, y, z] = shapeFactor(a, b, c);
            const index = ((j * sampleProvider.frequencyBands * count) + (i * count) + k) * 3;

            positions[index] = x + (a - 0.5) * sampleValue;
            positions[index + 1] = y + sampleValue;
            positions[index + 2] = z + (c - 0.5) * sampleValue;
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
          key={particles.length}
          attach="attributes-position"
          array={particles}
          count={particles.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        // transparent={true}
        // depthWrite={true}
        alphaMap={glitterTexture[0]}
        alphaTest={0.5}
        color="gold"
        map={glitterTexture[0]}
      />
    </points>
  );
};