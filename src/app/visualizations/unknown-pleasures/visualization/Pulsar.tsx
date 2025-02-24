import React from 'react'
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';
import { convertPulsarData } from './PulsarDataConverter';

export interface PulsarProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
}

export const Pulsar = ({ width, height, sampleProvider }: PulsarProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider, convertPulsarData);

  const getUniforms = () => {
    updateSampleTexture();
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      samplesActive: { value: sampleProvider.active ? 1 : 0 },
    }
  };

  return <ShaderImage
    imageUrls={{}}
    width={width}
    height={height}
    getUniforms={getUniforms}
    vertexShader={` 
      varying vec2 vUv;
      varying vec2 vPosition;
      varying vec2 vSize;
      
      void main() {
        vUv = uv;
        vSize = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
        vPosition = vec2(position + 0.5) * vSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `}
    fragmentShader={`
      precision mediump float;

      varying vec2 vUv;
      varying vec2 vPosition;
      varying vec2 vSize;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform int samplesActive;

      float _value(vec2 uv) {
        float currValue = texture2D(sampleData, uv).r;
        float nextValue = texture2D(sampleData, uv + vec2(0., 1. / sampleDataSize.y)).r;
        return mix(currValue, nextValue, fract(uv.y * sampleDataSize.y));
      }

      void main() {
        vec2 uv = vUv;
        float a = 0.;
        float h = .9;
        float lines = sampleDataSize.x;
        float distance = h / (lines - 1.);
        float strokeWidth = 2.5 / vSize.y;

        for (float i = 1.; i <= lines; i++) {
          float currLine = lines - i; // from top to bottom
          float value = _value(vec2(currLine/lines, uv.x)) * (1. - h);
          float d = uv.y - value - currLine * distance;
          a += min(1. - smoothstep(strokeWidth * .5, strokeWidth, d), 1.); // upper line edge
          a *= smoothstep(0., strokeWidth * .5, d); // lower line edge and mask
        }
        gl_FragColor = vec4(vec3(1.), a);
      }
    `}
  />;
}
