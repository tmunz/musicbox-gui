import { useCallback, useRef, useState } from 'react';
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
  pointerSensitivity?: number;
  maxBounces?: number;
  deflection?: number;
}

export const TheDarkSideOfTheMoon = (props: TheDarkSideOfTheMoonProps) => {
  return (
    <Canvas orthographic gl={{ antialias: false }} camera={{ position: [0, 0, 100], zoom: 70 }}>
      <color attach="background" args={['#000000']} />
      <Scene {...props} />
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.5} />
      </EffectComposer>
    </Canvas>
  );
};

const Scene = ({
  sampleProvider,
  volumeAmountIndicator = 1,
  dataRatio = 1,
  pointerSensitivity = 0.01,
  maxBounces = 10,
  deflection = 36,
}: TheDarkSideOfTheMoonProps) => {
  const [initialState, setInitialState] = useState(true);
  const beamRef = useRef<BeamApi | null>(null);
  const { current: start } = useRef(new Vector3(0, 0, 0));
  const { current: direction } = useRef(new Vector3(0, 0, 0));
  const { current: target } = useRef(new Vector3(0, 0.3, 0));

  const getStartPosition = (pointer: Vector2, viewport: Size): [number, number, number] => {
    const initialAngleRads = 0.25;
    const x = target.x - viewport.width / 2;
    const defaultStart: [number, number, number] = [x, target.y + x * Math.tan(initialAngleRads), 0];
    if (sampleProvider) {
      if (sampleProvider.active) {
        const minDistance = 1;
        const indicatorValue = (sampleProvider.getAvg()[0] / 255) * volumeAmountIndicator + 1 - volumeAmountIndicator;
        const directionVector = new Vector2(
          (pointer.x * viewport.width) / 2 - target.x,
          (pointer.y * viewport.height) / 2 - target.y
        );
        const totalDistance = directionVector.length();
        const direction = directionVector.normalize();
        const remainingDistance = totalDistance - minDistance;
        const adjustedDistance = minDistance + remainingDistance * indicatorValue;
        return [
          (1 - pointerSensitivity) * defaultStart[0] + pointerSensitivity * (target.x + direction.x * adjustedDistance),
          (1 - pointerSensitivity) * defaultStart[1] + pointerSensitivity * (target.y + direction.y * adjustedDistance),
          0,
        ];
      }
    } else {
      if (pointer.x !== 0 || pointer.y !== 0) {
        setInitialState(false);
      }
      if (!initialState) {
        return [(pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0];
      }
    }
    return defaultStart;
  };

  useFrame(({ pointer, viewport }) => {
    start.set(...getStartPosition(pointer, viewport));
    direction.copy(target).sub(start).normalize();
    beamRef.current?.setBeam(start, direction);
  });

  const deflectionFun = useCallback(
    (inDirection: Vector3, faceNormal: Vector3) => {
      const deflectionRad = (deflection * Math.PI) / 180;
      const deflectionDirection = inDirection.clone();
      const deflectionValue = Math.sin(-deflectionRad);
      deflectionDirection.add(faceNormal.clone().multiplyScalar(deflectionValue));
      return deflectionDirection.normalize();
    },
    [deflection]
  );

  return (
    <>
      <Beam
        ref={beamRef}
        maxBounces={maxBounces}
        deflection={deflectionFun}
        data={sampleProvider}
        dataRatio={dataRatio}
      >
        <pointLight position={[-2.3, 1, -2]} color={[127, 191, 255]} intensity={0.3} />
        <pointLight position={[2, 1, -2]} color={[127, 191, 255]} intensity={0.2} />
        <Prism position={[0, -0.5, 0]} />
      </Beam>
    </>
  );
};
