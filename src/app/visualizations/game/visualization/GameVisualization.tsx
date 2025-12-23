import React, { useRef } from 'react';
import { IUniform } from 'three';
import { RootState } from '@react-three/fiber';
import { SampleProvider } from '../../../audio/SampleProvider';
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { drawActor } from './drawActor';

export interface GameVisualizationProps {
  sampleProvider: SampleProvider;
  width: number;
  height: number;
  speed?: number;
}

export const GameVisualization = ({ sampleProvider, width, height, speed = 6.0 }: GameVisualizationProps) => {
  const startTimeRef = useRef<number>(Date.now());

  const getUniforms = (rootState: RootState): Record<string, IUniform> => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    
    // Get current audio intensity from sample provider
    let audioIntensity = 0;
    const avgValues = sampleProvider?.getAvg();
    if (avgValues && avgValues.length > 0) {
      audioIntensity = avgValues.reduce((a: number, b: number) => a + b, 0) / avgValues.length / 255;
    }

    return {
      time: { value: elapsed },
      audioIntensity: { value: audioIntensity },
      aspectRatio: { value: (width as number) / (height as number) },
      speed: { value: speed },
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
        uniform float audioIntensity;
        uniform float aspectRatio;
        uniform float speed;
        
        float sdfCircle(vec2 p, float r) {
          return length(p) - r;
        }
        
        ${drawActor}
        
        void main() {
          vec2 uv = vUv - 0.5;
          // Correct for aspect ratio by scaling the X coordinate
          uv.x *= aspectRatio;
          
          // Draw horizontal white line at center
          vec4 color = vec4(0.0);
          float centerLine = smoothstep(0.003, 0.001, abs(uv.y));
          if (centerLine > 0.0) {
            color = vec4(1.0, 1.0, 1.0, centerLine);
          }
          
          // Draw actor on top
          vec4 actorColor = drawActor(uv, time, speed);
          color = mix(color, actorColor, actorColor.a);
          
          gl_FragColor = color;
        }
      `}
    />
  );
};