import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, Texture } from 'three';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useTexture } from '@react-three/drei';
import './GlitterMaterial';
import { random } from '../../../utils/Random';

export interface GlitterParticlesProps {
  sampleProvider: SampleProvider;
  count?: number;
  textureScale?: number;
}

export const GlitterParticles = ({ sampleProvider, count = 50, textureScale = 0.01 }: GlitterParticlesProps) => {
  const pointsRef = useRef<Points | null>(null);
  const { current: glitterTexture } = useRef<Texture>(useTexture(require('./assets/gold-glitter-texture-seamless.jpg')) as unknown as Texture);

  const particles = useMemo(() => {
    const particleCount = sampleProvider.sampleSize * sampleProvider.frequencyBands * count;
    const positions = new Float32Array(particleCount * 3);
    const textureOffsets = new Float32Array(particleCount * 2);
    for (let i = 0; i < particleCount; i++) {
      textureOffsets[i * 2] = random(i);
      textureOffsets[i * 2 + 1] = random(i + particleCount);
    }
    return { positions, textureOffsets };
  }, [sampleProvider.sampleSize, sampleProvider.frequencyBands, textureScale]);

  // [0, 1]
  const shapeFactor = (x: number, y: number, k: number, i: number): number[] => {
    const xn = x * 2 - 1;
    const yn = y * 2 - 1;
    const bow = Math.pow(Math.cos(Math.pow(y, 2) * Math.PI * 0.5), 3) * 3;
    const width = -Math.pow(y, 2) + 0.6;
    const circle = Math.pow(1 - yn * yn, 0.5);
    const x0 = x * width - random(i + 10532437) * (1 - y) + bow + xn * circle;
    return [x0 - 0.7, yn * 1.6 + random(i) + 0.4, k * circle * (1 - Math.abs(xn))];
  }

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < sampleProvider.frequencyBands; i++) {
        for (let j = 0; j < sampleProvider.sampleSize; j++) {
          const sampleValue = sampleProvider.get(j)[i] / 255;
          for (let k = 0; k < count; k++) {
            const a = i / sampleProvider.frequencyBands;
            const b = 1 - (j / sampleProvider.sampleSize);
            const c = k / count;
            const index = ((j * sampleProvider.frequencyBands * count) + (i * count) + k) * 3;
            const [x, y, z] = shapeFactor(a, b, c, index);
            positions[index] = (x + (a - 0.5) * sampleValue * 0.2);
            positions[index + 1] = y - (1 - b) * sampleValue * 3;
            positions[index + 2] = (1 - b) * (z + (c - 0.5) * sampleValue);
          }
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry >
        <bufferAttribute
          key={'position-' + particles.positions.length}
          attach='attributes-position'
          array={particles.positions}
          count={particles.positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          key={'textureOffset-' + particles.textureOffsets.length}
          attach='attributes-textureOffset'
          array={particles.textureOffsets}
          count={particles.textureOffsets.length / 2}
          itemSize={2}
        />
      </bufferGeometry>
      <glitterMaterial
        textureImage={glitterTexture}
        textureScale={textureScale}
        size={0.4}
      />
    </points>
  );
};