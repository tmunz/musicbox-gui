import React, { useRef, useState } from 'react';
import { Canvas, useLoader, useFrame, Size } from '@react-three/fiber';
import { Bloom, EffectComposer, LUT } from '@react-three/postprocessing';
import { AmbientLight, Mesh, SpotLight, Texture, Vector2, Vector3 } from 'three';
import { LUTCubeLoader } from 'postprocessing';
import { Beam, BeamApi } from './components/Beam';
import { Prism } from './components/Prism';
import { FixedSizeQueue } from '../../utils/FixedSizeQueue';
import { OrbitControls } from '@react-three/drei';

export interface DarkSideOfTheMoonProps {
  sampleProvider: FixedSizeQueue<Uint8Array>;
  canvas: { width: number, height: number }
}

export function DarkSideOfTheMoon({ sampleProvider, canvas }: DarkSideOfTheMoonProps) {
  const texture = useLoader(LUTCubeLoader, require('./assets/F-6800-STD.cube')) as unknown as Texture;
  return (
    <Canvas orthographic gl={{ antialias: false }} camera={{ position: [0, 0, 100], zoom: 70 }}>
      <color attach='background' args={['black']} />
      <OrbitControls />
      <Scene />
      <EffectComposer>
        <Bloom mipmapBlur levels={9} intensity={1.5} luminanceThreshold={1} luminanceSmoothing={1} />
        <LUT lut={texture} />
      </EffectComposer>
    </Canvas>
  );
}

function Scene({ sampleProvider }: { sampleProvider?: FixedSizeQueue<Uint8Array> }) {
  const [isInit, setIsInit] = useState(true);
  const ambientRef = useRef<AmbientLight | null>(null);
  const spotRef = useRef<SpotLight | null>(null);
  const beamRef = useRef<BeamApi | null>(null);
  const prismRef = useRef<Mesh | null>(null);
  const { current: startVector } = useRef(new Vector3(0, 0, 0));
  const { current: targetVector } = useRef(new Vector3(0, 0, 0));

  const getInputPosition = (pointer: Vector2, viewport: Size): [number, number, number] => {
    if (sampleProvider) {
      const currentSample = sampleProvider.get(0);
      const currentSampleAvg = currentSample.reduce((acc, num) => acc + num, 0) / currentSample.length;
      const x = -1 * (1 - (currentSampleAvg / 255)) * viewport.width / 2;
      const y = -0.45 * (1 + (sampleProvider.get(0)[5] / 255)) * viewport.height / 2;
      return [x, y, 0];
    } else {
      if (pointer.x !== 0 || pointer.y !== 0) setIsInit(false);
      const x = (isInit ? -1 : pointer.x) * viewport.width / 2;
      const y = (isInit ? -0.45 : pointer.y) * viewport.height / 2;
      return [x, y, 0];
    }
  }

  useFrame(({ pointer, viewport }) => {
    if (!beamRef.current || !ambientRef.current) return;
    startVector.set(...getInputPosition(pointer, viewport));
    targetVector.copy(startVector).negate().normalize();
    beamRef.current.setBeam(startVector, targetVector);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0} />
      <pointLight position={[10, -10, 0]} intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={0.05} />
      <pointLight position={[-10, 0, 0]} intensity={0.05} />
      <spotLight ref={spotRef} intensity={1} distance={7} angle={1} penumbra={1} position={[0, 0, 1]} />
      <Prism position={[0, -0.5, 0]} ref={prismRef} />
      <Beam hitObject={prismRef.current} ref={beamRef} maxBounces={2} enableRainbow />
    </>
  );
}
