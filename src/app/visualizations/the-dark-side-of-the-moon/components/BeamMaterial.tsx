import { extend, Object3DNode } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { DataTexture, ShaderMaterial } from 'three';

// Based on
// "Improving the Rainbow" by Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow-2/
// "More accurate Iridescence" by Julia Poo: https://www.shadertoy.com/view/ltKcWh
// Code written by https://twitter.com/shuding_
extend({
  BeamMaterial: shaderMaterial(
    {
      startFade: 0,
      endFade: 0,
      startSize: 0,
      endSize: 1,
      intensity: 1,
      colorRatio: 1,
      sampleData: null,
      sampleDataSize: null,
      samplesActive: 0,
      sampleRatio: 1,
    },
    ` 
      varying vec2 vUv;
      varying vec2 vPosition;
      varying vec2 vSize;
      
      void main() {
        vUv = vec2(uv.x, 1.-uv.y);
        vSize = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
        vPosition = vec2(position + 0.5) * vSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    ` 
      precision mediump float;

      varying vec2 vUv;
      varying vec2 vPosition;
      varying vec2 vSize;
      uniform float startFade;
      uniform float endFade;
      uniform float startSize;
      uniform float endSize;
      uniform float colorRatio;
      uniform float intensity;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform int samplesActive;
      uniform float sampleRatio;
      
      vec3 _bump(vec3 x, vec3 y) {
        return clamp(1. - x*x - y, 0., 1.);
      }

      vec3 spectral_zucconi6 (float x) {
        const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
        const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
        const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);
        const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
        const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
        const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);
        return _bump(c1 * (x - x1), y1) + _bump(c2 * (x - x2), y2) ;
      }

      void main() {
        float rangeY = mix(startSize, endSize, vUv.x);
        vec2 uv = vec2(vUv.x, (vUv.y - .5 + rangeY * .5) / rangeY);

        vec3 spectralColor = spectral_zucconi6(-0.1 + uv.y * 1.2);
        vec3 color = mix(vec3(1.), spectralColor, colorRatio) * intensity;

        if (samplesActive == 1) {
          float value = texture(sampleData, uv.yx).r;
          color *= (1. - sampleRatio) + vec3(value) * sampleRatio;
        }

        float colorA = max(dot(color, vec3(1. / 3.)) * 2., 1.);
        float spotA = smoothstep(.0, .1, uv.y) * (1. - smoothstep(0.9, 1., uv.y));
        float startFadeA = smoothstep(0., startFade, vPosition.x);
        float endFadeA = 1. - smoothstep(vSize.x - endFade, vSize.x, vPosition.x);
        gl_FragColor = vec4(color, spotA * startFadeA * endFadeA);
      }
    `
  )
});

export interface BeamMaterial {
  startFade: number;
  endFade: number;
  startSize: number;
  endSize: number;
  colorRatio: number;
  intensity: number;
  sampleData?: DataTexture,
  sampleDataSize?: { x: number, y: number },
  samplesActive?: number;
  sampleRatio?: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      beamMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & Partial<BeamMaterial>;
    }
  }
}