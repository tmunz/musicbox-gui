import React, { useCallback, useRef, useState } from 'react';
import { Canvas, useLoader, useFrame, Size } from '@react-three/fiber';
import { Bloom, EffectComposer, LUT } from '@react-three/postprocessing';
import { AmbientLight, SpotLight, Texture, Vector2, Vector3 } from 'three';
import { LUTCubeLoader } from 'postprocessing';
import { Beam, BeamApi } from './components/Beam';
import { Prism } from './components/Prism';
import { SampleProvider } from '../../audio/SampleProvider';

export interface DarkSideOfTheMoonProps {
  sampleProvider: SampleProvider;
  canvas?: { width: number, height: number }
  volumeAmountIndicator?: number;
}

export const DarkSideOfTheMoon = ({ sampleProvider, volumeAmountIndicator }: DarkSideOfTheMoonProps) => {
  const texture = useLoader(LUTCubeLoader, require('./assets/F-6800-STD.cube')) as unknown as Texture;
  return (
    <Canvas orthographic gl={{ antialias: false }} camera={{ position: [0, 0, 100], zoom: 70 }}>
      <color attach='background' args={['black']} />
      <Scene sampleProvider={sampleProvider} volumeAmountIndicator={volumeAmountIndicator} />
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={1} luminanceSmoothing={0} />
        <LUT lut={texture} />
      </EffectComposer>
    </Canvas>
  );
}

const Scene = ({ sampleProvider, volumeAmountIndicator = 0 }: { sampleProvider?: SampleProvider, volumeAmountIndicator?: number }) => {
  const [initialState, setInitialState] = useState(true);
  const ambientRef = useRef<AmbientLight | null>(null);
  const spotRef = useRef<SpotLight | null>(null);
  const beamRef = useRef<BeamApi | null>(null);
  const { current: start } = useRef(new Vector3(0, 0, 0));
  const { current: direction } = useRef(new Vector3(0, 0, 0));
  const { current: target } = useRef(new Vector3(0, 0.3, 0));

  const getInputPosition = (pointer: Vector2, viewport: Size): [number, number, number] => {
    let x = target.x - viewport.width / 2;
    let angle = 0.25;
    if (sampleProvider) {
      if (sampleProvider.active) {
        angle -= pointer.y * 0.01;
        x *= (1 - volumeAmountIndicator) + sampleProvider.getAvg()[0] / 255 * volumeAmountIndicator;
      }
    } else {
      if (pointer.x !== 0 || pointer.y !== 0) {
        setInitialState(false);
      }
      if (!initialState) {
        return [
          pointer.x * viewport.width / 2,
          pointer.y * viewport.height / 2,
          0
        ];
      }
    }
    return [x, target.y + x * Math.tan(angle), 0];
  }

  useFrame(({ pointer, viewport }) => {
    start.set(...getInputPosition(pointer, viewport));
    direction.copy(target).sub(start).normalize();
    beamRef.current?.setBeam(start, direction);
  });

  const deflection = useCallback((inDirection: Vector3, faceNormal: Vector3) => {
    const deflectionDirection = inDirection.clone();
    const deflectionAmount = Math.sin(-Math.PI / 5);
    deflectionDirection.add(faceNormal.clone().multiplyScalar(deflectionAmount));
    return deflectionDirection.normalize();
  }, []);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0} />
      <pointLight position={[10, -10, 0]} intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={0.05} />
      <pointLight position={[-10, 0, 0]} intensity={0.05} />
      <spotLight ref={spotRef} intensity={1} distance={7} angle={1} penumbra={1} position={[0, 0, 1]} />
      <Beam ref={beamRef} maxBounces={2} deflection={deflection} data={sampleProvider} >
        <Prism position={[0, -0.5, 0]} />
      </Beam >
    </>
  );
}
