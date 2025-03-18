import React, { useRef } from 'react'
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';

export interface RoseProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
}

export const Rose = ({ width, height, sampleProvider }: RoseProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);

  const { current: imageUrls } = useRef({
    image: require('./rose.png'),
  });

  const getUniforms = () => {
    updateSampleTexture();
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      sampleDataAvg: { value: sampleProvider.getAvg()[0] / 255 },
      samplesActive: { value: sampleProvider.active ? 1 : 0 }
    }
  };

  return <ShaderImage
    imageUrls={imageUrls}
    objectFit='contain'
    width={width}
    height={height}
    getUniforms={getUniforms}
    fragmentShader={`
      precision mediump float;

      uniform sampler2D image;
      varying vec2 vUv;
      varying vec2 vPosition;
      varying vec2 vSize;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform int samplesActive;
      uniform float sampleDataAvg;

      void main( ) {
	      vec2 uv = vUv;
        vec4 color = texture(image, uv);
        gl_FragColor = color;
      }
    `}
  />;
}
