import React from 'react';
import { IUniform } from 'three';
import { RootState } from '@react-three/fiber';
import { SampleProvider } from '../../../audio/SampleProvider';
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { drawActor } from './Actor';
import { drawGround, getGroundY } from './Ground';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';
import { useElapsed } from '../../../utils/useElapsed';
import { useSampleProviderActive } from '../../../audio/useSampleProviderActive';

export interface SceneProps {
  sampleProvider: SampleProvider;
  width: number;
  height: number;
  volumeFactor?: number;
}

export const Scene = ({ sampleProvider, width, height, volumeFactor = 0.5 }: SceneProps) => {
  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);
  const [groundTexture, updateGroundTexture] = useSampleProviderTexture(
    sampleProvider,
    (sp) => {
      if (!sp) return new Uint8Array();
      // Inverted direction: newest value at the end, oldest first
      const arr = sp.samples.map((sample: Uint8Array) => {
        return Array.from(sample).reduce((sum: number, val: number) => sum + val, 0) / sample.length * (1.0 * volumeFactor);
      });
      return Uint8Array.from(arr.reverse());
    },
    (sp) => sp?.samples.length ?? 0,
    () => 1
  );

  const active = useSampleProviderActive(sampleProvider);
  const elapsed = useElapsed(active);

  const getUniforms = (rootState: RootState): Record<string, IUniform> => {
    updateGroundTexture();
    return {
      time: { value: elapsed },
      aspectRatio: { value: (width as number) / (height as number) },
      volumeFactor: { value: volumeFactor },
      groundData: { value: groundTexture },
      groundDataSize: { value: { x: groundTexture.image.width, y: groundTexture.image.height } },
      sampleData: { value: sampleProvider.samples }, // keep for later
      sampleDataSize: { value: { x: sampleProvider.samples.length, y: 1 } }, // keep for later
    };
  };

  return (
    <ShaderImage
      imageUrls={{}}
      width={width}
      height={height}
      getUniforms={getUniforms}
      fragmentShader={`
        precision mediump float;
        varying vec2 vUv;
        uniform float time;
        uniform float aspectRatio;
        uniform float volumeFactor;
        uniform sampler2D groundData;
        uniform vec2 groundDataSize;

        vec4 lineColor = vec4(1.);
        vec4 fillColor = vec4(0.0039, 0.6314, 0.0039, 1.0); // #01A101
        
        ${getGroundY}
        ${drawGround}
        ${drawActor}

        void main() {
          float yOffset = 0.5 * (1.0 - volumeFactor);
          vec2 uv = vec2((vUv.x - .5) * aspectRatio, vUv.y);
          vec2 groundUv = vec2((uv.x / aspectRatio) + 0.5, uv.y - yOffset);
          float groundY = getGroundY(groundUv.x, groundData, groundDataSize);
          vec4 actorColor = vec4(0.0);
          if (uv.y + 0.003 >= groundY + yOffset) {
            actorColor = drawActor(uv, time, lineColor, fillColor, groundUv, groundData, groundDataSize, yOffset, aspectRatio);
          }
          vec4 color = actorColor;
          if (actorColor.a == 0.0) {
            color = drawGround(groundUv, groundY, lineColor);
          }
          gl_FragColor = color;
        }
      `}
    />
  );
};