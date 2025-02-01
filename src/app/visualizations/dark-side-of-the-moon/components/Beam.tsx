import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Reflect, ReflectApi } from './Reflect';
import { AdditiveBlending, DynamicDrawUsage, InstancedMesh, Object3D, Vector3 } from 'three';

interface BeamProps {
  children: React.ReactNode;
  position: Vector3;
  stride?: number;
  width?: number;
}

export const Beam = forwardRef(({ children, position, stride = 4, width = 8, ...props }: BeamProps, fRef) => {
  const streaksRef = useRef<InstancedMesh>(null);
  const glowRef = useRef<InstancedMesh>(null);
  const reflectRef = useRef<ReflectApi>(null);
  const [streakTexture, glowRefTexture] = useTexture([require('../assets/lensflare/lensflare2.png'), require('../assets/lensflare/lensflare0_bw.jpg')]);

  const obj = new Object3D();
  const f = new Vector3();
  const t = new Vector3();
  const n = new Vector3();
  let i = 0;
  let range = 0;

  useFrame(() => {
    if (!reflectRef.current || !streaksRef.current || !glowRef.current) return;
    range = reflectRef.current.update() - 1;

    for (i = 0; i < range; i++) {
      f.fromArray(reflectRef.current.positions, i * 3);
      t.fromArray(reflectRef.current.positions, i * 3 + 3);
      n.subVectors(t, f).normalize();
      obj.position.addVectors(f, t).divideScalar(2);
      obj.scale.set(t.distanceTo(f) * stride, width, 1);
      obj.rotation.set(0, 0, Math.atan2(n.y, n.x));
      obj.updateMatrix();
      streaksRef.current.setMatrixAt(i, obj.matrix);
    }

    streaksRef.current.count = range;
    streaksRef.current.instanceMatrix.needsUpdate = true;

    for (i = 1; i < range; i++) {
      obj.position.fromArray(reflectRef.current.positions, i * 3);
      obj.scale.setScalar(0.75);
      obj.rotation.set(0, 0, 0);
      obj.updateMatrix();
      glowRef.current.setMatrixAt(i, obj.matrix);
    }

    glowRef.current.count = range;
    glowRef.current.instanceMatrix.needsUpdate = true;
  });

  useImperativeHandle(fRef, () => reflectRef.current, []);

  return (
    <group position={position}>
      <Reflect {...props} ref={reflectRef}>
        {children}
      </Reflect>
      <instancedMesh ref={streaksRef} args={[undefined, undefined, 100]} instanceMatrix-usage={DynamicDrawUsage}>
        <planeGeometry />
        <meshBasicMaterial map={streakTexture} opacity={1.2} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={glowRef} args={[undefined, undefined, 100]} instanceMatrix-usage={DynamicDrawUsage}>
        <planeGeometry />
        <meshBasicMaterial map={glowRefTexture} opacity={1} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
});
