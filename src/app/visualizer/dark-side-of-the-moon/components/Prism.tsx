import React from 'react';
import { GroupProps, useLoader } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import { BufferGeometry } from 'three';

interface PrismProps extends GroupProps {
  onRayOver?: (event: any) => void;
  onRayOut?: (event: any) => void;
  onRayMove?: (event: any) => void;
}

export function Prism({ onRayOver, onRayOut, onRayMove, ...props }: PrismProps) {
  const file = useLoader(GLTFLoader, require('../assets/prism.glb')) as unknown as { nodes: { Cone: { geometry: BufferGeometry } } };
  return (
    <group {...props}>
      {/* A low-res, invisible representation of the prism that gets hit by the raycaster */}
      <mesh visible={false} scale={1.9} rotation={[Math.PI / 2, Math.PI, 0]} onRayOver={onRayOver} onRayOut={onRayOut} onRayMove={onRayMove}>
        <cylinderGeometry args={[1, 1, 1, 3, 1]} />
      </mesh>
      {/* The visible hi-res prism */}
      <mesh position={[0, 0, 0.6]} renderOrder={1} scale={2} rotation={[0, Math.PI, 0]} dispose={null} geometry={file.nodes.Cone.geometry}>
        <MeshTransmissionMaterial clearcoat={1} transmission={0.95} thickness={10} roughness={0.05} anisotropy={0.1} chromaticAberration={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}
