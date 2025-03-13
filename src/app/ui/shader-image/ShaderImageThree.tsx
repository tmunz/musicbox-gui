import React, { useRef, useMemo, useEffect, useState, CSSProperties } from 'react';
import { Canvas, RootState, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { IUniform, Mesh, NearestFilter, ShaderMaterial, Texture, TextureLoader } from 'three';

export type ObjectFit = 'contain' | 'cover' | 'fill';

export const DEFAULT_IMAGE = 'image';

export const DEFAULT_FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D image;

  void main() {
    gl_FragColor = texture2D(image, vUv);
  }
`;

const DEFAULT_VERTEX_SHADER = `
  varying vec2 vUv; 

  void main() {
    vUv = uv; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export interface ShaderImageThreeProps {
  imageUrls?: Record<string, string>;
  objectFit?: ObjectFit;
  vertexShader?: string;
  fragmentShader?: string;
  getUniforms?: (rootState: RootState) => Record<string, IUniform>;
  style?: CSSProperties;
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

export const ShaderImageThreePlane = ({
  imageUrls = {},
  vertexShader = DEFAULT_VERTEX_SHADER,
  fragmentShader = DEFAULT_FRAGMENT_SHADER,
  objectFit = 'cover',
  getUniforms = () => ({}),
}: ShaderImageThreeProps) => {

  const ref = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const [textures, setTextures] = useState<Record<string, { loaded: boolean, url: string, data?: Texture }>>({});
  const rootState = useThree();

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

  const getUniformsWithTextures = () => {
    const imageUniforms = Object.keys(imageUrls).reduce((agg, id) => {
      const texture = textures[id];
      if (texture?.loaded && texture.data) {
        texture.data.magFilter = NearestFilter;
        texture.data.minFilter = NearestFilter;
        return { ...agg, [id]: { value: texture.data } };
      } else {
        return agg;
      }
    }, {});
    return { ...getUniforms(rootState), ...imageUniforms, };
  }

  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      transparent: true,
      uniforms: getUniformsWithTextures(),
      vertexShader,
      fragmentShader,
    });
  }, [vertexShader, fragmentShader, textures, getUniforms]);

  useEffect(() => {
    const mainTexture = textures[DEFAULT_IMAGE];
    if (ref.current) {
      if (mainTexture?.loaded) {
        const texture = mainTexture.data?.image;
        const scale = getScale(texture, rootState.size, objectFit);
        ref.current.scale.set(texture.width * scale.x, texture.height * scale.y, 1);
      } else {
        ref.current.scale.set(rootState.size.width, rootState.size.height, 1);
      }
    }
  }, [rootState.size, textures, ref.current, objectFit]);

  useFrame(() => {
    const material = materialRef.current;
    if (material) {
      const newUniforms = getUniformsWithTextures() as Record<string, IUniform>;
      Object.entries(newUniforms).forEach(([key, uniform]) => {
        material.uniforms[key].value = uniform.value;
      });
      materialRef.current.uniformsNeedUpdate = true;
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry />
      <primitive ref={materialRef} object={shaderMaterial} attach='material' transparency />
    </mesh>
  );
};

export const ShaderImageThree = (props: ShaderImageThreeProps) => {
  return (
    <Canvas orthographic style={props.style}>
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