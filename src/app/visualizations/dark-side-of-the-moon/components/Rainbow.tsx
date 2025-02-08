import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { extend, useFrame } from '@react-three/fiber';
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
      time: 0,
      speed: 1,
      fade: 0.5,
      startRadius: 1,
      endRadius: 1,
      emissiveIntensity: 2.5,
      ratio: 1
    },
    ` 
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix * modelPosition;
      }
    `,

    ` 
      varying vec2 vUv;
      uniform float fade;
      uniform float speed;
      uniform float startRadius;
      uniform float endRadius;
      uniform float emissiveIntensity;
      uniform float time;
      uniform float ratio;
    
      vec2 mp;
      // ratio: 1/3 = neon, 1/4 = refracted, 1/5+ = approximate white
      vec3 physhue2rgb(float hue, float ratio) {
        return smoothstep(vec3(0.0),vec3(1.0), abs(mod(hue + vec3(0.0,1.0,2.0)*ratio,1.0)*2.0-1.0));
      }

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
        vec2 uv = vec2(vUv.y, vUv.x) - vec2(0.5, 0.0);
        float a = atan(uv.x, uv.y) * 10.0;
        float s = uv.y * (endRadius - startRadius) + startRadius;
        float w = (uv.x / s + .5) * 300. + 400. + a;
        vec3 c = spectral_zucconi6(w, time); // [400, 700]
        float l = 1. - smoothstep(fade, 1., uv.y);
        float area = uv.y < 0. ? 0. : 1.;
        float brightness = smoothstep(0., 0.5, c.x + c.y + c.z);     
        gl_FragColor = vec4(area * c * l * brightness * emissiveIntensity, 1.0);
        if (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b < 0.01) discard;
      }
    `
  )
});

interface RainbowMaterial {
  time: number;
  speed: number;
  fade: number;
  startRadius: number;
  endRadius: number;
  ratio: number;
}

interface RainbowProps {
  startRadius?: number;
  endRadius?: number;
  emissiveIntensity?: number;
  fade?: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      rainbowMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & RainbowMaterial;
    }
  }
}

export interface RainbowApi {
  adjustBeam: (start: Vector3, end: Vector3, orientation: number) => void;
  setInactive: () => void;
}

export const Rainbow = forwardRef<RainbowApi, RainbowProps>(
  ({ startRadius = 0, endRadius = 1, emissiveIntensity = 2.5, fade = 0, ...props }, fref) => {
    const ref = useRef<Mesh>(null);
    const materialRef = useRef<RainbowMaterial | null>(null);

    useImperativeHandle(fref, () => ({
      adjustBeam: (start: Vector3, end: Vector3, orientation: number = 1) => {
        const direction = new Vector3().subVectors(end, start).normalize();
        const adjustedStart = direction.clone().negate().multiplyScalar(startRadius * 2).add(start);
        adjustedStart.addScaledVector(direction, startRadius);
        const distance = adjustedStart.distanceTo(end);
        const midPoint = new Vector3().lerpVectors(adjustedStart, end, 0.5);
        const angle = Math.atan2(direction.y, direction.x);
        ref.current?.position.copy(midPoint);
        ref.current?.rotation.set(0, 0, angle);
        ref.current?.scale.set(distance, orientation, 1);
      },
      setInactive: () => {
        ref.current?.scale.set(0, 0, 0);
      }
    }), []);

    useFrame((state, delta) => {
      if (materialRef.current) {
        materialRef.current.time += delta * materialRef.current.speed;
      }
    });

    return (
      <mesh ref={ref} {...props}>
        <planeGeometry />
        <rainbowMaterial
          ref={materialRef}
          fade={fade}
          startRadius={startRadius}
          endRadius={endRadius}
          emissiveIntensity={emissiveIntensity}
          ratio={1}
          toneMapped={false}
        />
      </mesh>
    );
  }
);
