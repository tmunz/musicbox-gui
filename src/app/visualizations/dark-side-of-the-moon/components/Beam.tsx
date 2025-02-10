import React, { useRef, useImperativeHandle, forwardRef, createRef } from 'react';
import { Vector3, Raycaster, Intersection, Object3D } from 'three';
import { BeamSection, BeamSectionApi, BeamSectionProps } from './BeamSection';
import { useFrame, useThree } from '@react-three/fiber';

export interface BeamApi {
  setBeam: (start: Vector3, direction: Vector3) => void;
}

interface BeamProps {
  maxBounces?: number;
  enableRainbow?: boolean;
  children?: React.ReactNode;
  deflection?: (inDirection: Vector3, faceNormal: Vector3) => Vector3;
}

const MIRROR_FUNCTION = (inDirection: Vector3, faceNormal: Vector3) => new Vector3().subVectors(inDirection, faceNormal.multiplyScalar(2 * inDirection.dot(faceNormal))).normalize();

export const Beam = forwardRef<BeamApi, BeamProps>(({ maxBounces = 10, deflection = MIRROR_FUNCTION, children }, ref) => {

  const beamStartRef = useRef<{ start: Vector3, direction: Vector3 }>({ start: new Vector3(), direction: new Vector3(1, 0, 0) });
  const beamSectionsRef = useRef<(BeamSectionApi | null)[]>([]);
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
      const curr = calculateBeamSection(prev.end, deflection(inDirection, startNormal), startNormal);
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
      {Array.from({ length: maxBounces + 1 }).map((_, i) => {
        let beamSectionProps: BeamSectionProps = {};
        if (i === 0) {
          beamSectionProps = { intensity: 3, enableGlow: true, enableFlare: true, startFade: 5 };
        } else if (i === maxBounces) {
          beamSectionProps = { intensity: 1.8, startRadius: 0.3, endRadius: 1, startFade: 1, endFade: 1, colorRatio: 1 };
        } else {
          beamSectionProps = { intensity: 2.2, startRadius: 0.2, endRadius: 1, startFade: 1, endFade: 1, colorRatio: 0.6 };
        }
        return <BeamSection
          key={i}
          ref={((e: BeamSectionApi) => beamSectionsRef.current[i] = e) as any}
          {...beamSectionProps}
        />;
      })}
    </>
  );
});
