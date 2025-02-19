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
      startRadius: 0,
      endRadius: 1,
      intensity: 1,
      colorRatio: 1,
      sampleData: null,
      sampleDataSize: null,
      samplesActive: 0,
      sampleRatio: 1,
    },
    ` 
      varying vec2 vUv;
      varying float vPositionY;
      varying float vLength;

      void main() {
        vUv = uv;
        vLength = length(vec3(modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2]));
        vPositionY = (position.y + 0.5) * vLength;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    ` 
      precision mediump float;

      varying vec2 vUv;
      varying float vPositionY;
      varying float vLength;
      uniform float startFade;
      uniform float endFade;
      uniform float startRadius;
      uniform float endRadius;
      uniform float colorRatio;
      uniform float intensity;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform int samplesActive;
      uniform float sampleRatio;

      float _saturate (float x) {
        return min(1.0, max(0.0,x));
      }

      vec3 _saturate (vec3 x) {
        return min(vec3(1.,1.,1.), max(vec3(0.,0.,0.),x));
      }
      
      vec3 bump3y(vec3 x, vec3 yoffset) {
        vec3 y = vec3(1.,1.,1.) - x * x;
        y = _saturate(y-yoffset);
        return y;
      }

      vec3 spectral_zucconi6(float w, float t) {    
        float x = _saturate((w - 400.0)/ 300.0);
        const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
        const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
        const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);
        const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
        const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
        const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);
        return bump3y(c1 * (x - x1), y1) + bump3y(c2 * (x - x2), y2);
      }

      void main() {
        vec2 uv = vec2(vUv.y, vUv.x - 0.5);
        float spotX = uv.x * (endRadius - startRadius) + startRadius;
        float spotFactor = 1. - abs(uv.y) / spotX * 2.;
        float sampleDataFactor = 1.0;

        if (samplesActive == 1) {	
          sampleDataFactor = texture2D(sampleData, vec2(spotFactor, uv.x)).r; 
        }
        vec3 spectralColor = spectral_zucconi6((uv.y / spotX + .5) * 300. + 400., 0.0); // [400, 700]
        vec3 whiteColor = vec3(spotFactor);
        vec3 color = mix(whiteColor, spectralColor, colorRatio);
        float startFadeFactor = smoothstep(0.0, startFade, vPositionY);
        float endFadeFactor = 1.0 - smoothstep(vLength - endFade, vLength, vPositionY);
        float brightness = smoothstep(0., 0.5, color.r + color.g + color.b) * intensity;
        gl_FragColor = vec4(color * brightness * sampleDataFactor, spotFactor * startFadeFactor * endFadeFactor);

        if (gl_FragColor.a < 0.0001) discard;
      }
    `
  )
});

export interface BeamMaterial {
  startFade: number;
  endFade: number;
  startRadius: number;
  endRadius: number;
  colorRatio: number;
  intensity: number;
  sampleData?: DataTexture,
  sampleDataSize?: { x: number, y: number },
  samplesActive?: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      beamMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & Partial<BeamMaterial>;
    }
  }
}