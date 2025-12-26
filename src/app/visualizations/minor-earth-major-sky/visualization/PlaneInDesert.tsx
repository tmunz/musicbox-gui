import { useRef } from 'react';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { LinearFilter } from 'three';
import { gaussianBlur } from '../../../utils/ShaderUtils';

export interface PlaneInDesertProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
  intensity?: number;
}

export const PlaneInDesert = ({ sampleProvider, width, height, intensity = 1 }: PlaneInDesertProps) => {
  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);

  const { current: imageUrls } = useRef({
    image: require('./plane-in-desert.jpg'),
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
      objectFit="cover"
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
      uniform float intensity;

      ${gaussianBlur}

      void main() {
        vec2 uv = vUv;

        float sampleValue = gaussianBlur(sampleData, vec2(uv.y, 1. - uv.x), 1. / min(sampleDataSize.x, sampleDataSize.y), 23, sampleDataSize).r;
        vec4 color = texture2D(image, uv);
        vec4 valueColor = vec4(.857, .794, .565, intensity) * sampleValue;
        color.rgb = mix(color.rgb, valueColor.rgb, clamp(valueColor.a, 0., 1.));
        gl_FragColor = color;
      }`}
    />
  );
};
