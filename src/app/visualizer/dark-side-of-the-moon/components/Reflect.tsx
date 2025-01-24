import React, { forwardRef, useRef, useMemo, useLayoutEffect, useImperativeHandle, ReactNode } from 'react';
import { invalidate } from '@react-three/fiber';
import { Group, Intersection, Object3D, Raycaster, Vector3 } from 'three';

// Type for ray-interactable objects
interface RayMesh extends Object3D {
  isMesh: boolean;
  onRayOver?: (event: any) => void;
  onRayOut?: (event: any) => void;
  onRayMove?: (event: any) => void;
}

function isRayMesh(object: Object3D): object is RayMesh {
  return (object as RayMesh).isMesh && !!((object as RayMesh).onRayOver || (object as RayMesh).onRayOut || (object as RayMesh).onRayMove);
}

// Type for the event created during ray interactions
interface RayEvent {
  api: ReflectAPI;
  object: Object3D;
  position: Vector3;
  direction?: Vector3;
  reflect?: Vector3;
  normal?: Vector3;
  intersect: Intersection;
  intersects: Intersection[];
  stopPropagation: () => void;
}

function createEvent(api: ReflectApi, hit: Hit, intersect: Intersection, intersects: Intersection[]): RayEvent {
  return {
    api,
    object: intersect.object,
    position: intersect.point,
    direction: intersect.direction,
    reflect: intersect.reflect,
    normal: intersect.face?.normal,
    intersect,
    intersects,
    stopPropagation: () => (hit.stopped = true),
  };
}

interface ReflectProps {
  children?: ReactNode;
  start?: [number, number, number];
  end?: [number, number, number];
  bounce?: number;
  far?: number;
  [key: string]: any;
}

export interface ReflectApi {
  number: number;
  objects: Object3D[];
  hits: Map<string, Hit>;
  start: Vector3;
  end: Vector3;
  raycaster: Raycaster;
  positions: Float32Array;
  setRay: (start?: [number, number, number], end?: [number, number, number]) => void;
  update: () => number;
}

// Type for hits tracked by the API
interface Hit {
  key: string;
  intersect: Intersection;
  stopped: boolean;
}

export const Reflect = forwardRef<ReflectApi, ReflectProps>(
  ({ children, start: _start = [0, 0, 0], end: _end = [0, 0, 0], bounce = 10, far = 100, ...props }, fRef) => {
    bounce = (bounce || 1) + 1;

    const scene = useRef<Group>(null);
    const vStart = new Vector3();
    const vEnd = new Vector3();
    const vDir = new Vector3();
    const vPos = new Vector3();

    let intersect: Intersection | null = null;
    let intersects: Intersection[] = [];

    const api = useMemo<ReflectApi>(
      () => ({
        number: 0,
        objects: [],
        hits: new Map(),
        start: new Vector3(),
        end: new Vector3(),
        raycaster: new Raycaster(),
        positions: new Float32Array(Array.from({ length: (bounce + 10) * 3 }, () => 0)),
        setRay: (_start = [0, 0, 0], _end = [0, 0, 0]) => {
          api.start.set(..._start);
          api.end.set(..._end);
        },
        update: () => {
          api.number = 0;
          intersects = [];

          vStart.copy(api.start);
          vEnd.copy(api.end);
          vDir.subVectors(vEnd, vStart).normalize();
          vStart.toArray(api.positions, api.number++ * 3);

          while (true) {
            api.raycaster.set(vStart, vDir);
            intersect = api.raycaster.intersectObjects(api.objects, false)[0];
            if (api.number < bounce && intersect && intersect.face) {
              intersects.push(intersect);
              intersect.direction = vDir.clone();
              intersect.point.toArray(api.positions, api.number++ * 3);
              vDir.reflect(intersect.object.localToWorld(intersect.face.normal).sub(intersect.object.getWorldPosition(vPos)).normalize());
              intersect.reflect = vDir.clone();
              vStart.copy(intersect.point);
            } else {
              vEnd.addVectors(vStart, vDir.multiplyScalar(far)).toArray(api.positions, api.number++ * 3);
              break;
            }
          }

          api.number = 1;
          api.hits.forEach((hit) => {
            if (!intersects.find((intersect) => intersect.object.uuid === hit.key)) {
              api.hits.delete(hit.key);
              if (hit.intersect.object.onRayOut) {
                invalidate();
                hit.intersect.object.onRayOut(createEvent(api, hit, hit.intersect, intersects));
              }
            }
          });

          for (intersect of intersects) {
            api.number++;
            if (!api.hits.has(intersect.object.uuid)) {
              const hit = { key: intersect.object.uuid, intersect, stopped: false };
              api.hits.set(intersect.object.uuid, hit);
              if (intersect.object.onRayOver) {
                invalidate();
                intersect.object.onRayOver(createEvent(api, hit, intersect, intersects));
              }
            }

            const hit = api.hits.get(intersect.object.uuid);

            if (intersect.object.onRayMove) {
              invalidate();
              intersect.object.onRayMove(createEvent(api, hit, intersect, intersects));
            }

            if (hit.stopped) break;
            if (intersect === intersects[intersects.length - 1]) api.number++;
          }
          return Math.max(2, api.number);
        },
      }),
      [bounce, far]
    );

    useLayoutEffect(() => void api.setRay(_start, _end), [..._start, ..._end]);
    useImperativeHandle(fRef, () => api, [api]);

    useLayoutEffect(() => {
      api.objects = [];
      scene.current?.traverse((object) => {
        if (isRayMesh(object)) api.objects.push(object);
      });
      scene.current?.updateWorldMatrix(true, true);
    });

    return (
      <group ref={scene} {...props}>
        {children}
      </group>
    );
  }
);
