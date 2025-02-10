import { extend, Object3DNode } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { Color, ShaderMaterial } from 'three';

extend({
  BeamMaterial: shaderMaterial(
    {
      color: new Color(1, 1, 1),
      intensity: 1,
      startFade: 1,
      endFade: 1,
    },
    `
      varying vec2 vUv;
      varying float vPositionY;
      varying float vBeamLength;

      void main() {
        vUv = uv;
        vBeamLength = length(vec3(modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2]));
        vPositionY = (position.y + 0.5) * vBeamLength;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    `
      varying vec2 vUv;
      varying float vPositionY;
      varying float vBeamLength;

      uniform vec3 color;
      uniform float intensity;
      uniform float startFade;
      uniform float endFade;

      void main() {
        float startFadeFactor = smoothstep(0.0, startFade, vPositionY);
        float endFadeFactor = 1.0 - smoothstep(vBeamLength - endFade, vBeamLength, vPositionY);
        float linearGradient = startFadeFactor * endFadeFactor;
        float glow = linearGradient * intensity;
        gl_FragColor = vec4(color * glow, glow);
        if (gl_FragColor.a < 0.1) discard;
      }
  `)
});

export interface BeamMaterial {
  color?: Color,
  intensity?: number,
  startFade?: number,
  endFade?: number,
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      beamMaterial: Object3DNode<BeamMaterial, typeof ShaderMaterial> & BeamMaterial;
    }
  }
}