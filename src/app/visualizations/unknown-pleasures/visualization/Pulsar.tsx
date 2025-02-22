import React from 'react'
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';

export interface PulsarProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
}

export const Pulsar = ({ width, height, sampleProvider }: PulsarProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);

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
      varying vec2 vUv;
      varying vec2 vPosition;
      varying vec2 vSize;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform int samplesActive;

      float random (in float x) {
        return fract(sin(x) * 43758.5453123);
      }

      float noise (in float x) {
        float i = floor(x);
        float f = fract(x);
        float a = random(i);
        float b = random(i + 1.);
        float u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u);
      }

      #define OCTAVES 3
      float fbm (in float x) {
        float value = 0.0;
        float amplitude = .5;
        float frequency = 0.;
        
        for (int i = 0; i < OCTAVES; i++) {
          value += amplitude * noise(x);
          x *= 2.;
          amplitude *= .7;
        }
        return value;
      }

      float _value(vec2 uv) {
        return texture2D(sampleData, vec2(uv.y, 0.)).r;
      }

      void main() {
        vec2 fragCoord = vUv * vSize;
        vec2 st = (2. * fragCoord - vSize) / vSize.y;
        
        st.y *= 40.;
        
        float linewidth = 40. * 3.2 / vSize.y;
        
        float color = 0.;
        if(abs(st.x) < 1.){
          float env = pow(cos(st.x * 3.14159 / 2.), 4.9);
          float i = floor(st.y);
          float h = 35.;
          for (float n = max(-h, i - 6.); n <= min(h, i); n++) {
            float f = st.y - n;
            float y = f - 0.5;
            float waveheight = 6.6;
            y -= waveheight * pow(fbm(st.x * 10.504 + n * 432.1 + 0.5 * _value(vUv)), 3.) * env
                + (fbm(st.x * 25. + n * 1292.21) - 0.32) * 2. * 0.15;
            float grid = abs(y);
            color += (1. - smoothstep(0., linewidth, grid));
            if(y < 0.) {
              break;
            }
          }
        }
        gl_FragColor = vec4(vec3(color), 1.0);
      }
    `}
  />;
}






// precision mediump float;

// varying vec2 vUv;
// varying vec2 vPosition;
// varying vec2 vSize;
// uniform sampler2D sampleData;
// uniform vec2 sampleDataSize;
// uniform int samplesActive;

// float _value(vec2 uv) {
//   return texture2D(sampleData, vec2(uv.y, 0.)).r;
// }

// float weight(float x) {
//   return (1. - 2. * abs(x - .5)) * 0.4;
// }

// void main() {
//   vec2 uv = vUv;
//   float h = .5;
//   float color = 0.;
//   float distance = h / (sampleDataSize.x - 1.);
//   float strokeWidth = 4. / vSize.y;
//   float baseY = uv.y - _value(uv) * weight(uv.x);
//   if (mod(baseY, distance) <= strokeWidth && baseY - strokeWidth <= h) {  
//     float line = smoothstep(0., uv.y, uv.y + strokeWidth);        
//     color = line;
//   }
//   gl_FragColor = vec4(vec3(color), 1.0);
// }












// for (float i = 0.; i < lines; i++) {
//   float value = _value(uv.xy) * weight(uv.x);
//   float baseY = uv.y * h - (1. - i / lines);
//   vec2 p = 1. - _line(strokeWidth, baseY - value / lines);
//   color = mix(color, p.x, p.y);
// }