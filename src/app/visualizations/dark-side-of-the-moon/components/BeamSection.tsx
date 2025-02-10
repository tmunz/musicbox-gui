import './BeamMaterial';
import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { AdditiveBlending, DynamicDrawUsage, Group, InstancedMesh, Mesh, Object3DEventMap, Vector3 } from 'three';
import { Flare } from './Flare';

export interface BeamSectionApi {
  adjustBeam: (start: Vector3, end: Vector3, width?: number) => void;
  setInactive: () => void;
}

export interface BeamSectionProps {
  enableGlow?: boolean;
  enableFlare?: boolean;
  startFade?: number;
  endFade?: number;
  intensity?: number;
}

export const BeamSection = forwardRef<BeamSectionApi, BeamSectionProps>(({ enableFlare = false, enableGlow = false, startFade = 0, endFade = 0, intensity = 1 }, fref) => {
  const [glowRefTexture] = useTexture([
    require('../assets/lensflare/lensflare0_bw.jpg')
  ]);

  const streaksRef = useRef<InstancedMesh>(null);
  const glowRef = useRef<InstancedMesh>(null);
  const flareRef = useRef<Group<Object3DEventMap>>(null);
  const mainRef = useRef<Mesh>(null);

  useImperativeHandle(fref, () => ({
    adjustBeam: (start: Vector3, end: Vector3, width: number = 1) => {
      const distance = start.distanceTo(end);
      const midPoint = new Vector3().lerpVectors(start, end, 0.5);
      const direction = new Vector3().subVectors(end, start).normalize();
      const angle = Math.atan2(direction.y, direction.x);

      mainRef.current?.position.copy(midPoint);
      mainRef.current?.rotation.set(0, 0, angle - Math.PI / 2);
      mainRef.current?.scale.set(width * 0.025, distance, 1);

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
      <mesh ref={mainRef}>
        <planeGeometry />
        <beamMaterial intensity={intensity} startFade={startFade} endFade={endFade} />
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
