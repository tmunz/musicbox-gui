import * as THREE from 'three';
import { useRef, useCallback, useState } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { Center, Text3D } from '@react-three/drei';
import { Bloom, EffectComposer, LUT } from '@react-three/postprocessing';
import { LUTCubeLoader } from 'postprocessing';
import { Beam } from './components/Beam';
import { Rainbow } from './components/Rainbow';
import { Prism } from './components/Prism';
import { Flare } from './components/Flare';
import { calculateRefractionAngle, lerp, lerpV3 } from './Util';
import React from 'react';

export default function DarkSideOfTheMoon() {
  const texture = useLoader(LUTCubeLoader, require('./assets/F-6800-STD.cube'));
  return (
    <Canvas orthographic gl={{ antialias: false }} camera={{ position: [0, 0, 100], zoom: 70 }}>
      <color attach="background" args={['black']} />
      <Scene />
      <EffectComposer disableNormalPass>
        <Bloom mipmapBlur levels={9} intensity={1.5} luminanceThreshold={1} luminanceSmoothing={1} />
        <LUT lut={texture} />
      </EffectComposer>
    </Canvas>
  );
}

function Scene() {
  const [isPrismHit, hitPrism] = useState(false);
  const flare = useRef(null);
  const ambient = useRef(null);
  const spot = useRef(null);
  const boxreflect = useRef(null);
  const rainbow = useRef(null);

  const rayOut = useCallback(() => hitPrism(false), []);
  const rayOver = useCallback((e) => {
    e.stopPropagation();
    hitPrism(true);
    rainbow.current.material.speed = 1;
    rainbow.current.material.emissiveIntensity = 20;
  }, []);

  const vec = new THREE.Vector3();
  const rayMove = useCallback(({ api, position, direction, normal }) => {
    if (!normal) return;
    vec.toArray(api.positions, api.number++ * 3);
    flare.current.position.set(position.x, position.y, -0.5);
    flare.current.rotation.set(0, 0, -Math.atan2(direction.x, direction.y));
    let angleScreenCenter = Math.atan2(-position.y, -position.x);
    const normalAngle = Math.atan2(normal.y, normal.x);
    const incidentAngle = angleScreenCenter - normalAngle;
    const refractionAngle = calculateRefractionAngle(incidentAngle) * 6;
    angleScreenCenter += refractionAngle;
    rainbow.current.rotation.z = angleScreenCenter;
    lerpV3(spot.current.target.position, [Math.cos(angleScreenCenter), Math.sin(angleScreenCenter), 0], 0.05);
    spot.current.target.updateMatrixWorld();
  }, []);

  useFrame((state) => {
    boxreflect.current.setRay([(state.pointer.x * state.viewport.width) / 2, (state.pointer.y * state.viewport.height) / 2, 0], [0, 0, 0]);
    lerp(rainbow.current.material, 'emissiveIntensity', isPrismHit ? 2.5 : 0, 0.1);
    spot.current.intensity = rainbow.current.material.emissiveIntensity;
    lerp(ambient.current, 'intensity', 0, 0.025);
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0} />
      <pointLight position={[10, -10, 0]} intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={0.05} />
      <pointLight position={[-10, 0, 0]} intensity={0.05} />
      <spotLight ref={spot} intensity={1} distance={7} angle={1} penumbra={1} position={[0, 0, 1]} />
      <Beam ref={boxreflect} bounce={10} far={20}>
        <Prism position={[0, -0.5, 0]} onRayOver={rayOver} onRayOut={rayOut} onRayMove={rayMove} />
      </Beam>
      <Rainbow ref={rainbow} startRadius={0} endRadius={0.3} fade={0.1} />
      <Flare ref={flare} visible={isPrismHit} renderOrder={10} scale={1.25} streak={[12.5, 20, 1]} />
    </>
  );
}
