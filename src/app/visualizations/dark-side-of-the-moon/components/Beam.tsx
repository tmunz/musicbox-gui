import React, { useRef, useImperativeHandle, forwardRef, createRef } from 'react';
import { Mesh, Vector3, Raycaster, Intersection, Object3D } from 'three';
import { BeamSection, BeamSectionApi } from './BeamSection';
import { useFrame, useThree } from '@react-three/fiber';
import { Rainbow, RainbowApi } from './Rainbow';

export interface BeamApi {
  setBeam: (start: Vector3, direction: Vector3) => void;
}

interface BeamProps {
  maxBounces?: number;
  enableRainbow?: boolean;
  children?: React.ReactNode;
}

export const Beam = forwardRef<BeamApi, BeamProps>(({ maxBounces = 10, enableRainbow = false, children }, ref) => {

  const beamStartRef = useRef<{ start: Vector3, direction: Vector3 }>({ start: new Vector3(), direction: new Vector3(1, 0, 0) });
  const beamSectionsRef = useRef<(BeamSectionApi | RainbowApi | null)[]>([]);
  const hitObjectsRefs = useRef<(React.RefObject<Object3D> | null)[]>([]);
  const { width, height } = useThree((state) => state.viewport);
  const far = Math.hypot(width / 2, height / 2);
  const { current: raycaster } = useRef<Raycaster>(new Raycaster());
  raycaster.far = far;

  const calculateBeamSection = (start: Vector3, direction: Vector3, startNormal?: Vector3): { start: Vector3, end: Vector3, endNormal?: Vector3, orientation: number } => {
    raycaster.set(start, direction);
    let intersections: Intersection[] = [];

    hitObjectsRefs.current.forEach((hitObjectRef) => {
      const childObject = hitObjectRef?.current;
      if (childObject instanceof Object3D) {
        const hitResults = raycaster.intersectObject(childObject, false);
        intersections = intersections.concat(hitResults);
      }
    });

    const hit = intersections.find((intersection) => intersection.distance >= 1e-6);
    let orientation = 1;
    if (startNormal) {
      orientation = Math.sign(new Vector3().crossVectors(startNormal, direction).z);
    }
    if (hit) {
      const globalNormal = hit.face?.normal?.clone().applyMatrix4(hit.object.matrixWorld).normalize();
      return { start, end: hit.point, endNormal: globalNormal, orientation };
    } else {
      return { start, end: direction.multiplyScalar(far), orientation };
    }
  }

  const calculateBeamSections = (start: Vector3, direction: Vector3) => {
    let remainingRays = maxBounces + 1;
    const sections: { start: Vector3; end: Vector3, endNormal?: Vector3, orientation: number }[] = [calculateBeamSection(start, direction)];

    while (remainingRays > 0) {
      const prev = sections[sections.length - 1];
      const inDirection = new Vector3().subVectors(prev.end, prev.start).normalize();
      const startNormal = prev.endNormal;
      if (!startNormal) break;
      const outDirection = calculateOutDirection(inDirection, startNormal, -Math.PI / 5);
      const curr = calculateBeamSection(prev.end, outDirection, startNormal);
      sections.push(curr);
      remainingRays--;
    }
    return sections;
  };

  useImperativeHandle(ref, () => ({
    setBeam: (start: Vector3, direction: Vector3) => {
      beamStartRef.current = { start, direction };
    }
  }), [children]);

  useFrame(() => {
    const sections = calculateBeamSections(beamStartRef.current.start, beamStartRef.current.direction);
    Array.from({ length: maxBounces + 1 }).forEach((_, i) => {
      const section = sections[i];
      if (section) {
        beamSectionsRef.current[i]?.adjustBeam(section.start, section.end, i < sections.length - 1 ? 0.8 : 2, section.orientation);
      } else {
        beamSectionsRef.current[i]?.setInactive();
      }
    });
  });


  React.Children.forEach(children, (_, i) => {
    if (!hitObjectsRefs.current[i]) {
      hitObjectsRefs.current[i] = createRef<Object3D>();
    }
  });

  return (
    <>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child as React.ReactElement, { ref: hitObjectsRefs.current[index] })
      )}
      <BeamSection ref={e => beamSectionsRef.current[0] = e} intensity={2} enableGlow enableFlare startFade={5} />
      {Array.from({ length: maxBounces }).map((_, i_) => {
        const i = i_ + 1;
        if (enableRainbow) {
          return <Rainbow
            key={i}
            ref={e => beamSectionsRef.current[i] = e}
            intensity={1.6}
            startRadius={0.3}
            endRadius={1}
            startFade={1}
            endFade={1}
          />;
        } else {
          return <BeamSection
            key={i}
            ref={e => beamSectionsRef.current[i] = e}
            intensity={2}
          />;
        }
      })}
    </>
  );
});

const calculateOutDirection = (inDirection: Vector3, faceNormal: Vector3, angleInRadians?: number) => {
  const dotProduct = inDirection.dot(faceNormal);
  if (angleInRadians === undefined) {
    return new Vector3().subVectors(inDirection, faceNormal.multiplyScalar(2 * dotProduct)).normalize();
  } else {
    const deflectionDirection = inDirection.clone();
    const deflectionAmount = Math.sin(angleInRadians);
    deflectionDirection.add(faceNormal.clone().multiplyScalar(deflectionAmount));
    return deflectionDirection.normalize();
  }
}
