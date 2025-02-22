import React, { useCallback, useRef, useState } from 'react';
import { Canvas, useFrame, Size } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Vector2, Vector3 } from 'three';
import { Beam, BeamApi } from './components/Beam';
import { Prism } from './components/Prism';
import { SampleProvider } from '../../audio/SampleProvider';

export interface TheDarkSideOfTheMoonProps {
  sampleProvider?: SampleProvider;
  volumeAmountIndicator?: number;
  dataRatio?: number;
}

export const TheDarkSideOfTheMoon = (props: TheDarkSideOfTheMoonProps) => {

  return (
    <Canvas orthographic gl={{ antialias: false }} camera={{ position: [0, 0, 100], zoom: 70 }}>
      <color attach='background' args={['#000000']} />
      <Scene {...props} />
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.5} />
      </EffectComposer>
    </Canvas>
  );
}

const Scene = ({ sampleProvider, volumeAmountIndicator = 1, dataRatio = 1 }: TheDarkSideOfTheMoonProps) => {
  const [initialState, setInitialState] = useState(true);
  const beamRef = useRef<BeamApi | null>(null);
  const { current: start } = useRef(new Vector3(0, 0, 0));
  const { current: direction } = useRef(new Vector3(0, 0, 0));
  const { current: target } = useRef(new Vector3(0, 0.3, 0));

  const getStartPosition = (pointer: Vector2, viewport: Size): [number, number, number] => {
    let x = target.x - viewport.width / 2;
    let angle = 0.25;
    if (sampleProvider) {
      if (sampleProvider.active) {
        const minDistance = 1;
        angle -= pointer.y * 0.01;
        const indicatorValue = sampleProvider.getAvg()[0] / 255 * volumeAmountIndicator + 1 - volumeAmountIndicator;
        x = -minDistance + Math.min(x + minDistance, 0) * indicatorValue;
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
    start.set(...getStartPosition(pointer, viewport));
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
      <Beam ref={beamRef} maxBounces={2} deflection={deflection} data={sampleProvider} dataRatio={dataRatio} >
        <pointLight position={[-2.3, 1, -2]} color={[127, 191, 255]} intensity={0.3} />
        <pointLight position={[2, 1, -2]} color={[127, 191, 255]} intensity={0.2} />
        <Prism position={[0, -0.5, 0]} />
      </Beam >
    </>
  );
}
