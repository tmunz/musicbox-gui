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
  const [volumeTexture, updateVolumeTexture] = useSampleProviderTexture(
    sampleProvider,
    (sp) => {
      if (!sp) return new Uint8Array();
      return Uint8Array.from(sp.samples.map((sample: Uint8Array) => {
        return Array.from(sample).reduce((sum: number, val: number) => sum + val, 0) / sample.length * (1.0 * volumeFactor);
      }));
    },
    (sp) => sp?.samples.length ?? 0,
    () => 1
  );

  const active = useSampleProviderActive(sampleProvider);
  const elapsed = useElapsed(active);

  const getUniforms = (rootState: RootState): Record<string, IUniform> => {
    updateVolumeTexture();
    return {
      time: { value: elapsed },
      aspectRatio: { value: (width as number) / (height as number) },
      volumeFactor: { value: volumeFactor },
      volumeData: { value: volumeTexture },
      volumeDataSize: { value: { x: volumeTexture.image.width, y: volumeTexture.image.height } },
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
        uniform sampler2D volumeData;
        uniform vec2 volumeDataSize;
        
        ${getGroundY}
        ${drawGround}
        ${drawActor}

        void main() {
          vec2 uv = vec2((vUv.x - .5) * aspectRatio, vUv.y - 0.5 * (1. - volumeFactor));
          vec4 actorColor = drawActor(uv, time, volumeData, volumeDataSize);
          float groundY = getGroundY(uv.x, aspectRatio, volumeData, volumeDataSize);
          if (uv.y < groundY - 0.003) {
            actorColor.a = 0.0;
          }
          vec4 color = actorColor;
          if (actorColor.a == 0.0) {
            color = drawGround(uv.y, groundY);
          }
          gl_FragColor = color;
        }
      `}
    />
  );
};