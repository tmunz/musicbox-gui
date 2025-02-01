import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import React from 'react';
import { PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from 'three';
import { Banana } from './Banana';

export const Bananas = ({ count = 1, depth = 20 }) => {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const cameraDistance = 10;
  const [peeled, setPeeled] = useState(false);

  useEffect(() => {
    const camera = cameraRef.current;
    if (camera) {
      camera.position.set(0, 0, cameraDistance);
      camera.setFocalLength(80);
      camera.lookAt(new Vector3(0, 0, 0));
    }
  }, [depth]);

  return (
    <Canvas dpr={[1, 2]} onClick={() => setPeeled(b => !b)}>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={20} near={0.1} far={cameraDistance + depth} position={[0, 0, cameraDistance]} />
      <OrbitControls enabled={false}/>
      <color attach='background' args={['#fffffa']} />
      {Array.from({ length: count }, (_, i) => <Banana key={i} z={0} x={0} peeled={peeled} />)}
      <Environment preset='sunset' />
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
