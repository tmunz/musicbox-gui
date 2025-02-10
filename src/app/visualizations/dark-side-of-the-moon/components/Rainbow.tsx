import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { Object3DNode } from '@react-three/fiber/dist/declarations/src/three-types';
import { Mesh, ShaderMaterial, Vector3 } from 'three';

// Based on
// "Improving the Rainbow" by Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow-2/
// "More accurate Iridescence" by Julia Poo: https://www.shadertoy.com/view/ltKcWh
// Code written by https://twitter.com/shuding_
extend({
  RainbowMaterial: shaderMaterial(
    {
      startFade: 0,
      endFade: 0,
      startRadius: 0,
      endRadius: 1,
      intensity: 1,
      colorRatio: 1,
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
      varying vec2 vUv;
      varying float vPositionY;
      varying float vLength;
      uniform float startFade;
      uniform float endFade;
      uniform float startRadius;
      uniform float endRadius;
      uniform float colorRatio;
      uniform float intensity;

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
        vec2 uv = vec2(vUv.y, vUv.x) - vec2(0.0, 0.5);
        float spot = uv.x * (endRadius - startRadius) + startRadius;
        vec3 spectralColor = spectral_zucconi6((uv.y / spot + .5) * 300. + 400., 0.0); // [400, 700]
        vec3 whiteColor = vec3(1. - abs(uv.y) / spot * 2.);
        vec3 color = mix(whiteColor, spectralColor, colorRatio);
        float startFadeFactor = smoothstep(0.0, startFade, vPositionY);
        float endFadeFactor = 1.0 - smoothstep(vLength - endFade, vLength, vPositionY);
        float linearGradient = startFadeFactor * endFadeFactor;
        float brightness = smoothstep(0., 0.5, color.r + color.g + color.b); 
        float glow = linearGradient * intensity * brightness;    
        gl_FragColor = vec4(color * glow, glow);
        if (gl_FragColor.a < 0.1) discard;
      }
    `
  )
});

interface RainbowMaterial {
  startFade: number;
  endFade: number;
  startRadius: number;
  endRadius: number;
  colorRatio: number;
  intensity: number;
}

interface RainbowProps {
  startRadius?: number;
  endRadius?: number;
  startFade?: number;
  endFade?: number;
  colorRatio?: number;
  intensity?: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      rainbowMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & Partial<RainbowMaterial>;
    }
  }
}

export interface RainbowApi {
  adjustBeam: (start: Vector3, end: Vector3, width?: number, orientation?: number) => void;
  setInactive: () => void;
}

export const Rainbow = forwardRef<RainbowApi, RainbowProps>(
  ({ startRadius = 0, endRadius = 1, startFade = 0, endFade = 0, intensity = 1, colorRatio = 1, ...props }, fref) => {
    const ref = useRef<Mesh>(null);
    const materialRef = useRef<RainbowMaterial | null>(null);

    useImperativeHandle(fref, () => ({
      adjustBeam: (start: Vector3, end: Vector3, width: number = 1, orientation: number = 1) => {
        const direction = new Vector3().subVectors(end, start).normalize();
        const adjustedStart = direction.clone().negate().multiplyScalar(startRadius * width).add(start);
        const distance = adjustedStart.distanceTo(end);
        const midPoint = new Vector3().lerpVectors(start, end, 0.5);
        const angle = Math.atan2(direction.y, direction.x);
        ref.current?.position.copy(midPoint);
        ref.current?.rotation.set(0, 0, angle - Math.PI / 2);
        ref.current?.scale.set(width * orientation, distance, 1);
      },
      setInactive: () => {
        ref.current?.scale.set(0, 0, 0);
      }
    }), []);

    return (
      <mesh ref={ref} {...props} scale={[0, 0, 0]}>
        <planeGeometry />
        <rainbowMaterial
          ref={materialRef as any}
          startFade={startFade}
          endFade={endFade}
          startRadius={startRadius}
          endRadius={endRadius}
          colorRatio={colorRatio}
          intensity={intensity}
          toneMapped={false}
        />
      </mesh>
    );
  }
);
