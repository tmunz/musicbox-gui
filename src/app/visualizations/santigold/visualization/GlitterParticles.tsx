import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';

export const GlitterParticles = () => {
  const pointsRef = useRef<Points>(null!);
  
  const particles = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          array={particles}
          count={particles.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color='gold' />
    </points>
  );
};