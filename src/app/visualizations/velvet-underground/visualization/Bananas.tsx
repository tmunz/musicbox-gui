import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import React from 'react';
import { Group, PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from 'three';
import { Banana } from './Banana';
import { SampleProvider } from '../../../audio/SampleProvider';

export const Bananas = ({ sampleProvider, depth = 20 }: { sampleProvider: SampleProvider, depth?: number }) => {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const cameraDistance = 10;
  const [bananaPeeled, setBananaPeeled] = useState(false);

  useEffect(() => {
    const camera = cameraRef.current;
    if (camera) {
      camera.position.set(0, 0, cameraDistance);
      camera.setFocalLength(80);
      camera.lookAt(new Vector3(0, 0, 0));
    }
  }, [depth]);

  return (
    <Canvas dpr={[1, 2]} onClick={() => setBananaPeeled(b => !b)}>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={20} near={0.1} far={cameraDistance + depth} position={[0, 0, cameraDistance]} />
      <OrbitControls enabled={false} />
      <color attach='background' args={['#fffffa']} />
      <Scene sampleProvider={sampleProvider} bananaPeeled={bananaPeeled} />
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <DepthOfField
          target={[0, 0, 0]}
          focusDistance={(cameraRef.current?.position.z ?? 10) / ((cameraRef.current?.far ?? 100) - (cameraRef.current?.near ?? 0.1))}
          focusRange={0.1}
          focalLength={0.1}
          bokehScale={10}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  )
}

const Scene = ({ sampleProvider, bananaPeeled = false }: { sampleProvider?: SampleProvider, bananaPeeled?: boolean }) => {

  const bananaRef = useRef<Group>(null);

  useFrame(() => {
    if (sampleProvider?.active && bananaRef.current) {
      const avg = sampleProvider.getAvg()[0];
      bananaRef.current.position.set(0, -avg / 255 * 0.1, 0); // TODO improve dummy visualisation
    }
  });

  return <>
    <Banana ref={bananaRef} peeled={bananaPeeled} />
    <ambientLight intensity={3} />
    <pointLight position={[0, 1, 2]} intensity={5} />
  </>
}
