import React, { useRef } from "react";
import { SampleProvider } from "../../../audio/SampleProvider";
import { useSampleProviderTexture } from "../../../audio/useSampleProviderTexture";
import { ShaderImage } from "../../../ui/shader-image/ShaderImage";

export interface BedroomProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
}

export const Bedroom = ({ sampleProvider, width, height }: BedroomProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);
  const { current: imageUrls } = useRef({
    image: require('./bedroom.jpg'),
  });

  const getUniforms = () => {
    updateSampleTexture();
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      sampleDataAvg: { value: sampleProvider.getAvg()[0] / 255 },
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
      varying vec2 vUv;
      uniform sampler2D image;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform float sampleDataAvg;

      void main() {
        vec2 uv = vUv;
        vec4 color = texture2D(image, uv);
        vec4 sampleColor = vec4(vec3(texture2D(sampleData, uv).r), 1.0);
        gl_FragColor = mix(color, sampleColor, .3);
      }
    `}
  />;
};
