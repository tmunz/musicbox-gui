import React, { useRef } from 'react';
import { IUniform } from 'three';
import { RootState } from '@react-three/fiber';
import { SampleProvider } from '../../../audio/SampleProvider';
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { drawActor } from './drawActor';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';

export interface GameVisualizationProps {
  sampleProvider: SampleProvider;
  width: number;
  height: number;
  speed?: number;
}

export const GameVisualization = ({ sampleProvider, width, height, speed = 8.0 }: GameVisualizationProps) => {
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
      speed: { value: speed },
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
        uniform float speed;
        uniform sampler2D volumeData;
        uniform vec2 volumeDataSize;

        float sdfCircle(vec2 p, float r) {
          return length(p) - r;
        }
        
        ${drawActor}
        
        void main() {
          vec2 uv = vUv - 0.5;
          uv.x *= aspectRatio;
          float leftEdge = -0.5 * aspectRatio;
          float rightEdge = 0.5 * aspectRatio;
          float totalWidth = rightEdge - leftEdge;
          int volumeCount = int(volumeDataSize.x);
          float t = clamp((rightEdge - uv.x) / totalWidth, 0.0, 1.0);
          float sampleIdx = t * float(volumeCount - 1);
          float volume = texture2D(volumeData, vec2(sampleIdx / float(volumeCount), 0.5)).r * 0.2;
          float circle = smoothstep(0.005, 0.0, abs(uv.y - volume));
          vec4 color = vec4(1., 1., 1., 0.);
          if (circle > 0.0) {
            color = vec4(1.0, 1.0, 1.0, circle);
          }
          vec4 actorColor = drawActor(uv, time, speed);
          color = mix(color, actorColor, actorColor.a);
          gl_FragColor = color;
        }
      `}
    />
  );
};