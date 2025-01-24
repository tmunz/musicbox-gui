import React, { useRef, useCallback, useState } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, LUT } from '@react-three/postprocessing';
import { AmbientLight, Group, Mesh, SpotLight, Texture, Vector3 } from 'three';
import { LUTCubeLoader } from 'postprocessing';
import { Beam } from './components/Beam';
import { Prism } from './components/Prism';
import { Flare } from './components/Flare';
import { calculateRefractionAngle, lerp, lerpV3 } from './Util';
import { Rainbow } from './components/Rainbow';
import { ReflectApi } from './components/Reflect';
import { Point2 } from '../../utils/Point';


export default function DarkSideOfTheMoon() {
  const texture = useLoader(LUTCubeLoader, require('./assets/F-6800-STD.cube')) as unknown as Texture;
  return (
    <Canvas orthographic gl={{ antialias: false }} camera={{ position: [0, 0, 100], zoom: 70 }}>
      <color attach="background" args={['black']} />
      <Scene />
      <EffectComposer>
        <Bloom mipmapBlur levels={9} intensity={1.5} luminanceThreshold={1} luminanceSmoothing={1} />
        <LUT lut={texture} />
      </EffectComposer>
    </Canvas>
  );
}

function Scene() {
  const [isPrismHit, hitPrism] = useState(false);
  const ambientRef = useRef<AmbientLight | null>(null);
  const spotRef = useRef<SpotLight | null>(null);
  const flareRef = useRef<Group | null>(null);
  const beamRef = useRef<Mesh | null>(null);
  const rainbowRef = useRef<Mesh | null>(null);

  const rayOut = useCallback(() => hitPrism(false), []);
  const rayOver = useCallback((e) => {
    e.stopPropagation();
    hitPrism(true);
    if (!rainbowRef.current?.material) return;
    rainbowRef.current.material.emissiveIntensity = 20;
  }, []);

  const vec = new Vector3();
  const rayMove = useCallback(({ api, position, direction, normal }: { api: ReflectApi, position: Vector3, direction: Point2, normal: Point2 }) => {
    if (!normal || !flareRef.current || !rainbowRef.current || !spotRef.current) return;
    vec.toArray(api.positions, api.number++ * 3);
    flareRef.current.position.set(position.x, position.y, -0.5);
    flareRef.current.rotation.set(0, 0, -Math.atan2(direction.x, direction.y));
    let angleScreenCenter = Math.atan2(-position.y, -position.x);
    const normalAngle = Math.atan2(normal.y, normal.x);
    const incidentAngle = angleScreenCenter - normalAngle;
    const refractionAngle = calculateRefractionAngle(incidentAngle) * 6;
    angleScreenCenter += refractionAngle;
    rainbowRef.current.rotation.z = angleScreenCenter;
    lerpV3(spotRef.current.target.position, [Math.cos(angleScreenCenter), Math.sin(angleScreenCenter), 0], 0.05);
    spotRef.current.target.updateMatrixWorld();
  }, []);

  useFrame((state) => {
    if (!beamRef.current || !rainbowRef.current || !ambientRef.current) return;
    beamRef.current.setRay([(state.pointer.x * state.viewport.width) / 2, (state.pointer.y * state.viewport.height) / 2, 0], [0, 0, 0]);
    lerp(rainbowRef.current.material, 'emissiveIntensity', isPrismHit ? 2.5 : 0, 0.1);
    spotRef.current.intensity = rainbowRef.current.material.emissiveIntensity;
    lerp(ambientRef.current, 'intensity', 0, 0.025);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0} />
      <pointLight position={[10, -10, 0]} intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={0.05} />
      <pointLight position={[-10, 0, 0]} intensity={0.05} />
      <spotLight ref={spotRef} intensity={1} distance={7} angle={1} penumbra={1} position={[0, 0, 1]} />
      <Beam ref={beamRef} bounce={10} far={20}>
        <Prism position={[0, -0.5, 0]} onRayOver={rayOver} onRayOut={rayOut} onRayMove={rayMove} />
      </Beam>
      <Rainbow ref={rainbowRef} startRadius={0} endRadius={0.3} fade={0.1} />
      <Flare ref={flareRef} visible={isPrismHit} renderOrder={10} scale={1.25} streak={[12.5, 20, 1]} />
    </>
  );
}
