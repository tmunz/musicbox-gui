import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { IUniform, Mesh, ShaderMaterial, Texture, TextureLoader } from 'three';

export type ObjectFit = 'contain' | 'cover' | 'fill';

export const DEFAULT_IMAGE = 'image';

export const DEFAULT_FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D image;

  void main() {
    gl_FragColor = texture2D(image, vUv);
  }`;

export interface ShaderImageProps {
  imageUrls: Record<string, string>;
  objectFit?: ObjectFit;
  vertexShader?: string;
  fragmentShader?: string;
  uniforms?: any
}

export function getScale(
  texture: { width: number; height: number },
  container: { width: number; height: number },
  objectFit: ObjectFit
): { x: number; y: number } {
  const scaleX = container.width / texture.width;
  const scaleY = container.height / texture.height;

  switch (objectFit) {
    case 'cover': {
      const scale = Math.max(scaleX, scaleY);
      return { x: scale, y: scale };
    }
    case 'contain': {
      const scale = Math.min(scaleX, scaleY);
      return { x: scale, y: scale };
    }
    case 'fill': {
      return { x: scaleX, y: scaleY };
    }
    default:
      return { x: 1, y: 1 };
  }
}

interface Props extends ShaderImageProps {
  uniforms?: { [uniform: string]: IUniform }
}

const DEFAULT_VERTEX_SHADER = `
  varying vec2 vUv; 

  void main() {
    vUv = uv; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ShaderImageThreePlane = ({
  imageUrls,
  vertexShader = DEFAULT_VERTEX_SHADER,
  fragmentShader = DEFAULT_FRAGMENT_SHADER,
  objectFit = 'cover',
  uniforms = {},
}: Props) => {

  const ref = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const [textures, setTextures] = useState<Record<string, { loaded: boolean, url: string, data?: Texture }>>({});
  const { size } = useThree();

  useEffect(() => {
    Object.entries(imageUrls).forEach(([id, url]) => {
      setTextures(textures => {
        if (textures[id]?.url === url) {
          return textures;
        } else {
          new TextureLoader().load(url, (textureData) => {
            setTextures(textures => {
              const texture = { ...textures[id], data: textureData, loaded: true };
              return { ...textures, [id]: texture };
            });
          });
          return { ...textures, [id]: { loaded: false, url } };
        }
      });
    });
  }, [imageUrls]);

  const getUniforms = () => {
    const imageUniforms = Object.keys(imageUrls).reduce((agg, id) => {
      const texture = textures[id];
      if (texture?.loaded) {
        return { ...agg, [id]: { value: texture.data } };
      } else {
        return agg;
      }
    }, {});
    return { ...uniforms, ...imageUniforms, };
  }

  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      transparent: true,
      uniforms: getUniforms(),
      vertexShader,
      fragmentShader,
    });
  }, [vertexShader, fragmentShader, uniforms, textures]);

  useEffect(() => {
    const mainTexture = textures[DEFAULT_IMAGE]
    if (ref.current && mainTexture?.loaded) {
      const texture = mainTexture.data?.image;
      const scale = getScale(texture, size, objectFit);
      ref.current.scale.set(texture.width * scale.x, texture.height * scale.y, 1);
    }
  }, [size, textures, ref.current, objectFit]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms = getUniforms();
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <primitive ref={materialRef} object={shaderMaterial} attach="material" />
    </mesh>
  );
};

export const ShaderImageThree = (props: Props) => {
  return (
    <Canvas orthographic style={{ width: '100%', height: '100%' }}>
      <OrthographicCamera
        makeDefault
        near={0}
        far={2}
        position={[0, 0, 1]}
      />
      <ShaderImageThreePlane {...props} />
    </Canvas>
  );
};