import { useRef } from 'react';
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';
import { gaussianBlur } from '../../../utils/ShaderUtils';
import { LinearFilter } from 'three';

export interface TeeProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
  intensity?: number;
}

export const Tee = ({ width, height, sampleProvider, intensity = 1 }: TeeProps) => {
  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);
  const { current: imageUrls } = useRef({
    image: require('./tee.png'),
  });

  const getUniforms = () => {
    updateSampleTexture();
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      intensity: { value: intensity },
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
      vertexShader={`
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        precision mediump float;
        varying vec2 vUv;

        uniform sampler2D image;
        uniform sampler2D sampleData;
        uniform vec2 sampleDataSize;
        uniform float intensity;

        ${gaussianBlur}

        void main() {
          vec2 uv = vUv;

          float railHeight = .55;
          float normalizedHeight = uv.y / railHeight;
          float perspectiveCompression = pow(normalizedHeight, 1.8);
          float leftTopRails = .0 + 0.65 * pow(normalizedHeight, 1.2);
          float rightTopRails = .72 + 0.24 * pow(normalizedHeight, 8.6);
          bool insideRails = (uv.y <= railHeight) && (uv.x >= leftTopRails) && (uv.x <= rightTopRails);

          vec4 color = vec4(0., 0., 0., 0.);
          
          if (insideRails) {
            float x = 1.- (uv.x - leftTopRails) / (rightTopRails - leftTopRails);
            vec2 dataUv = vec2(x, perspectiveCompression);
            float sampleValue = gaussianBlur(sampleData, vec2(dataUv.x, dataUv.y), 
              1. / min(sampleDataSize.x, sampleDataSize.y), 9, sampleDataSize).r;
            vec4 valueColor = vec4(1., 1., 1., intensity) * pow(sampleValue * 1.2, 1.2);
            color = valueColor;
          }
          
          vec4 imageColor = texture2D(image, uv);
          color = mix(color, imageColor, imageColor.a);
          
          gl_FragColor = color;
        }`}
    />
  );
};
