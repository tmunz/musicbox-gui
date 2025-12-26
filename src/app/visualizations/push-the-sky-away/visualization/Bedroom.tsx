import { useRef } from 'react';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { LinearFilter } from 'three';
import { RootState } from '@react-three/fiber';
import { convertLightData } from './LightDataConverter';
import { gaussianBlur } from '../../../utils/ShaderUtils';

export interface BedroomProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
  perspectiveEffect?: number;
}

export const Bedroom = ({ sampleProvider, width, height, perspectiveEffect = 0.08 }: BedroomProps) => {
  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider, convertLightData);

  const { current: imageUrls } = useRef({
    image: require('./bedroom.jpg'),
    depthMap: require('./bedroom-depth-map.jpg'),
  });

  const getUniforms = (rootState: RootState) => {
    updateSampleTexture();

    return {
      perspective: { value: [rootState.pointer.x ?? 0, rootState.pointer.y ?? 0] },
      perspectiveEffect: { value: [perspectiveEffect, perspectiveEffect] },
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
    };
  };

  return (
    <ShaderImage
      imageUrls={imageUrls}
      objectFit="contain"
      width={width}
      height={height}
      getUniforms={getUniforms}
      imageFilter={LinearFilter}
      fragmentShader={`
      precision mediump float;
      varying vec2 vUv;

      uniform sampler2D image;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform sampler2D depthMap;
      uniform vec2 perspective;
      uniform vec2 perspectiveEffect;

      ${gaussianBlur}

      void main() {
        vec2 uv = vUv;
        vec2 perspectiveUv = uv;
        vec2 wallY = vec2(0.22, 0.90);
        
        if (wallY.t < uv.y) { // ceiling
          perspectiveUv = vec2(.5 - (uv.x - .5) / (.5 - uv.y) * .4, uv.y);
        } else if (uv.y < wallY.s) { // floor
          perspectiveUv = vec2(.5 + (uv.x - .5) / (.5 - uv.y) * .28, uv.y);
        }

        float c = 2.25;
        float d = 0.55;
        float sampleValue = gaussianBlur(
          sampleData, 
          vec2(perspectiveUv.y, fract(abs(mod((perspectiveUv.x + d) * c * 2., 2.) - 1.)) * c / 2.),
          1. / sampleDataSize.x, 
          23, 
          sampleDataSize / 10.
        ).r;

        float depth = texture2D(depthMap, uv).r;
        // float zoomValue = -(1. + zoom) * zoomEffect * 0.1; // (uv - 0.5) * zoomValue + ...
        vec2 perspectiveValue = perspective * perspectiveEffect * 0.1;
        vec2 offset = (depth - 0.5) * perspectiveValue;

        vec4 color = texture2D(image, uv + offset);

        float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        float factor = smoothstep(.78, 1., luminance);
        color.rgb *= mix(1., 1. + sampleValue * .1, factor);

        // float t = (perspectiveUv.x + d) * c * 2.;
        // color = mix(color, vec4(fract(t), 0., 0., 1.), fract(t));

        // color.rgb = vec3(sampleValue);

        gl_FragColor = color;
      }`}
    />
  );
};
