import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React from "react";
import { Suspense, useEffect, useRef } from "react";
import { AnimationAction, AnimationClip, AnimationMixer, Clock, Group, LoopOnce } from "three";

export const Banana = ({ x = 0, z = 0, peeled = false }) => {
  const modelRef = useRef<Group>(null!);
  const file = useGLTF(require('./assets/banana-peel.glb')) as unknown as {
    scene: any;
    nodes: any;
    materials: any;
    animations: AnimationClip[];
  };

  const mixer = useRef<AnimationMixer | null>(null);
  const clock = useRef(new Clock());
  const actions = useRef<AnimationAction[]>([]);

  useEffect(() => {
    if (file.animations.length > 0) {
      if (!mixer.current) {
        mixer.current = new AnimationMixer(file.scene);
      }

      if (actions.current.length === 0) {
        actions.current = file.animations.map((clip: AnimationClip) => {
          const action = mixer.current!.clipAction(clip);
          action.clampWhenFinished = true;
          action.loop = LoopOnce;
          action.timeScale = 2.0;
          return action;
        });
      }

      actions.current.forEach((action: AnimationAction) => {
        if (peeled) {
          action.timeScale = 2.0;
          action.reset().play();
        } else {
          action.timeScale = -2.0;
          action.paused = false;
          action.play();
        }
      });
    }
  }, [file, peeled]);

  useFrame(() => {
    if (mixer.current) {
      mixer.current.update(clock.current.getDelta());
    }
  });

  return (
    <Suspense fallback={null}>
      <group ref={modelRef} position={[x, 0, z]} scale={[0.6, 0.6, 0.6]}>
        {file && (
          <primitive object={file.scene} />
        )}
      </group>
    </Suspense>
  );
};