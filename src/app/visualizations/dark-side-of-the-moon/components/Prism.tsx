import React, { forwardRef } from 'react';
import { GroupProps, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { BufferGeometry, DoubleSide, Mesh } from 'three';
import { MeshTransmissionMaterial } from '@react-three/drei';

export const Prism = forwardRef<Mesh, GroupProps>((props, ref) => {
  const file = useLoader(GLTFLoader, require('../assets/prism.glb')) as unknown as { nodes: { Cone: { geometry: BufferGeometry } } };

  return (
    <group {...props}>
      <mesh visible={false} scale={1.9} rotation={[Math.PI / 2, Math.PI, 0]} ref={ref}>
        <cylinderGeometry args={[1, 1, 1, 3, 1]} />
        <meshBasicMaterial side={DoubleSide} />
      </mesh>
      <mesh
        position={[0, 0, 0.6]}
        renderOrder={1}
        scale={2}
        rotation={[0, Math.PI, 0]}
        dispose={null}
        geometry={file.nodes.Cone.geometry}
      >
        <MeshTransmissionMaterial
          clearcoat={1}
          transmission={0.95}
          thickness={10}
          roughness={0.05}
          anisotropy={0.1}
          chromaticAberration={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
});
