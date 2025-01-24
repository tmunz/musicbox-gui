import React from 'react';
import { forwardRef, Ref, useRef } from 'react';
import { useTexture, Instances, Instance } from '@react-three/drei';
import { GroupProps, useFrame } from '@react-three/fiber';
import { AdditiveBlending, Group, Object3DEventMap, Vector3 } from 'three';

interface FlareProps extends GroupProps {
  streak?: Vector3 | [number, number, number];
  visible?: boolean;
}

export const Flare = forwardRef(({ streak = new Vector3(8, 20, 1), visible, ...props }: FlareProps, flareRef: Ref<Group<Object3DEventMap>> | undefined) => {
  const groupRef = useRef<Group>(null);
  const [streakTexture, dotTexture, glowTexture] = useTexture([
    require('../assets/lensflare/lensflare2.png'),
    require('../assets/lensflare/lensflare3.png'),
    require('../assets/lensflare/lensflare0_bw.png')
  ]);

  useFrame((state) => {
    groupRef.current?.children.forEach((instance) => {
      instance.position.x = (Math[instance.scale.x > 1 ? 'sin' : 'cos']((state.clock.elapsedTime * instance.scale.x) / 2) * instance.scale.x) / 10;
      instance.position.y = (Math[instance.scale.x > 1 ? 'cos' : 'atan'](state.clock.elapsedTime * instance.scale.x) * instance.scale.x) / 10;
    });
  });

  return (
    <group ref={flareRef} {...props} visible={visible} dispose={null}>
      <Instances frames={visible ? Infinity : 1}>
        <planeGeometry />
        <meshBasicMaterial map={dotTexture} transparent opacity={1} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        <group ref={groupRef}>
          <Instance scale={0.5} />
          <Instance scale={1.25} />
          <Instance scale={0.75} />
          <Instance scale={1.5} />
          <Instance scale={2} position={[0, 0, -0.7]} />
        </group>
      </Instances>
      <mesh scale={0.2}>
        <planeGeometry />
        <meshBasicMaterial map={glowTexture} transparent opacity={1} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} scale={streak}>
        <planeGeometry />
        <meshBasicMaterial map={streakTexture} transparent opacity={0.1} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
});
