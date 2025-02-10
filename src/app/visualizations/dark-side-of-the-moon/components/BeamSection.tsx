import './BeamMaterial';
import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { AdditiveBlending, DynamicDrawUsage, Group, InstancedMesh, Mesh, Object3DEventMap, Vector3 } from 'three';
import { Flare } from './Flare';

export interface BeamSectionApi {
  adjustBeam: (start: Vector3, end: Vector3, width?: number, orientation?: number) => void;
  setInactive: () => void;
}

export interface BeamSectionProps {
  startRadius?: number;
  endRadius?: number;
  startFade?: number;
  endFade?: number;
  colorRatio?: number;
  intensity?: number;
  enableGlow?: boolean;
  enableFlare?: boolean;
}

export const BeamSection = forwardRef<BeamSectionApi, BeamSectionProps>(({ startRadius = 0.1, endRadius = 0.1, startFade = 0, endFade = 0, intensity = 1, colorRatio = 1, enableFlare = false, enableGlow = false, ...props }, fref) => {
  const [glowRefTexture] = useTexture([
    require('../assets/lensflare/lensflare0_bw.png')
  ]);

  const streaksRef = useRef<InstancedMesh>(null);
  const glowRef = useRef<InstancedMesh>(null);
  const flareRef = useRef<Group<Object3DEventMap>>(null);
  const mainRef = useRef<Mesh>(null);

  useImperativeHandle(fref, () => ({
    adjustBeam: (start: Vector3, end: Vector3, width: number = 1, orientation: number = 1) => {
      const direction = new Vector3().subVectors(end, start).normalize();
      const adjustedStart = direction.clone().negate().multiplyScalar(startRadius * width).add(start);
      const distance = adjustedStart.distanceTo(end);
      const midPoint = new Vector3().lerpVectors(start, end, 0.5);
      const angle = Math.atan2(direction.y, direction.x);

      mainRef.current?.position.copy(midPoint);
      mainRef.current?.rotation.set(0, 0, angle - Math.PI / 2);
      mainRef.current?.scale.set(width * orientation, distance, 1);

      glowRef.current?.position.copy(end);
      glowRef.current?.scale.set(1, 1, 1);

      flareRef.current?.position.copy(end);
      flareRef.current?.scale.set(1, 1, 1);
    },
    setInactive: () => {
      streaksRef.current?.scale.set(0, 0, 0);
      glowRef.current?.scale.set(0, 0, 0);
      flareRef.current?.scale.set(0, 0, 0);
      mainRef.current?.scale.set(0, 0, 0);
    }
  }), []);

  return (
    <>
      <mesh ref={mainRef} {...props} scale={[0, 0, 0]}>
        <planeGeometry />
        <beamMaterial
          startFade={startFade}
          endFade={endFade}
          startRadius={startRadius}
          endRadius={endRadius}
          colorRatio={colorRatio}
          intensity={intensity}
          toneMapped={false}
        />
      </mesh>
      {enableGlow && <instancedMesh ref={glowRef} args={[undefined, undefined, 100]} instanceMatrix-usage={DynamicDrawUsage}>
        <planeGeometry />
        <meshBasicMaterial
          map={glowRefTexture}
          opacity={0.01}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>}
      <Flare ref={flareRef} visible={enableFlare} renderOrder={10} streak={[12, 8, 8]} />
    </>
  );
});
