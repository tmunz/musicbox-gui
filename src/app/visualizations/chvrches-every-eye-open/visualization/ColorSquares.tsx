import React, { useRef } from "react";
import { SampleProvider } from "../../../audio/SampleProvider";
import { useSampleProviderTexture } from "../../../audio/useSampleProviderTexture";
import { ShaderImage } from "../../../ui/shader-image/ShaderImage";

export interface ColorSquaresProps {
  size: number;
  sampleProvider: SampleProvider;
  visibilityThreshold?: number;
  backgroundImage?: number;
  colorHigh?: [number, number, number];
  colorLow?: [number, number, number];
}

export const ColorSquares = ({ sampleProvider, size, visibilityThreshold, backgroundImage = 0 }: ColorSquaresProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);
  const { current: imageUrls } = useRef({
    image: require('./color-squares.png'),
    colorMap: require('./flowers.jpg'),
  });

  const getUniforms = () => {
    updateSampleTexture();
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      sampleDataAvg: { value: sampleProvider.getAvg()[0] / 255 },
      samplesActive: { value: sampleProvider.active ? 1 : 0 },
      visibilityThreshold: { value: visibilityThreshold ?? 0.5 },
      backgroundImage: { value: backgroundImage },
    }
  };

  return <ShaderImage
    imageUrls={imageUrls}
    objectFit='contain'
    width={size}
    height={size}
    getUniforms={getUniforms}
    fragmentShader={`
      precision mediump float;

      uniform sampler2D image;
      uniform sampler2D colorMap;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform float sampleDataAvg;
      uniform int samplesActive;
      uniform float visibilityThreshold;
      uniform float backgroundImage;
      in vec2 vUv;

      vec2 _max(sampler2D img, float x, float height) {
        // maxValue, maxValueRelevance
        vec2 d = vec2(0.0);
        for (float y = 0.; y <= height; y++) {
          vec4 value = texture2D(img, vec2(x, y / height));
          if (value.r > d.s) {
            d.s = value.r;
            d.t =  1. - y / height;
          }
        }
        return d;
      }

      void main() {
        vec2 uv = vUv; 
        vec4 color = vec4(0.); 

        color = mix(color, texture2D(colorMap, uv), backgroundImage);
        float dataSide = floor(sqrt(sampleDataSize.x));
        float texel = 1. / (dataSide + 2.);

        if (texel <= uv.x && texel <= uv.y && uv.x <= 1. - texel && uv.y <= 1. - texel) {
          vec2 dUv = (uv  - texel) / (1. - 2. * texel);
          float dataSlot = (floor(dUv.y * dataSide) * dataSide + floor(dUv.x * dataSide)) / sampleDataSize.x;
          vec2 daxel = 1. / sampleDataSize;
          vec2 value = _max(sampleData, dataSlot, sampleDataSize.y); 
          // float currentValue = texture2D(sampleData, vec2(dataSlot, 0)).r;      
          float topValue = _max(sampleData, dataSlot + dataSide * daxel.x, sampleDataSize.y).s;
          float rightValue = _max(sampleData, dataSlot + daxel.x, sampleDataSize.y).s;
          float bottomValue = _max(sampleData, dataSlot - dataSide * daxel.x, sampleDataSize.y).s;
          float leftValue = _max(sampleData, dataSlot - daxel.x, sampleDataSize.y).s;

          if (samplesActive == 0) {
            vec4 overlayColor = texture2D(image, dUv);
            color = mix(color, overlayColor, overlayColor.a);
          } else if (value.s >= max(max(topValue, rightValue), max(bottomValue, leftValue))) {
            vec4 baseColor = texture2D(colorMap, floor(uv / texel) * texel  + (.5 * texel));
            baseColor.a = value.s >= visibilityThreshold ? value.t + 0.2 : 0.;
            color = mix(baseColor, color, clamp(backgroundImage - baseColor.a, 0., 1.));
          }
        }
        
        gl_FragColor = color;
      }
    `}
  />;
};
