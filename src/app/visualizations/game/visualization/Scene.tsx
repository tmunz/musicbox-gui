import React, { useRef } from 'react';
import { IUniform } from 'three';
import { RootState } from '@react-three/fiber';
import { SampleProvider } from '../../../audio/SampleProvider';
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { drawActor } from './Actor';
import { drawGround, getGroundY } from './Ground';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';

export interface SceneProps {
  sampleProvider: SampleProvider;
  width: number;
  height: number;
  speed?: number;
}

export const Scene = ({ sampleProvider, width, height }: SceneProps) => {
  const startTimeRef = useRef<number>(Date.now());
  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);

  const [volumeTexture, updateVolumeTexture] = useSampleProviderTexture(
    sampleProvider,
    (sp) => {
      if (!sp) return new Uint8Array();
      return Uint8Array.from(sp.samples.map((sample: Uint8Array) => {
        return Array.from(sample).reduce((sum: number, val: number) => sum + val, 0) / sample.length;
      }));
    },
    (sp) => sp?.samples.length ?? 0,
    () => 1
  );

  const getUniforms = (rootState: RootState): Record<string, IUniform> => {
    updateVolumeTexture();
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    return {
      time: { value: elapsed },
      aspectRatio: { value: (width as number) / (height as number) },
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
      vertexShader={`
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        precision mediump float;
        varying vec2 vUv;
        uniform float time;
        uniform float aspectRatio;
        uniform sampler2D volumeData;
        uniform vec2 volumeDataSize;

        float sdfCircle(vec2 p, float r) {
          return length(p) - r;
        }
        
        ${getGroundY}
        ${drawGround}
        ${drawActor}

        void main() {
          vec2 uv = vec2((vUv.x - .5) * aspectRatio, vUv.y - 0.25);
          float groundFactor = .5;
          float groundY = getGroundY(uv.x, aspectRatio, volumeData, volumeDataSize, groundFactor);

          int volumeCount = int(volumeDataSize.x);
          int centerIdx = volumeCount / 2;
          float centerVolume = texture2D(volumeData, vec2(float(centerIdx) / float(volumeCount), 0.)).r;
          float newestVolume = texture2D(volumeData, vec2(0., 0.)).r;
          vec2 actorUv = uv;
          actorUv.y -= centerVolume * groundFactor;

          vec4 actorColor = drawActor(actorUv, time, 600. / volumeDataSize.x, newestVolume - centerVolume);
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