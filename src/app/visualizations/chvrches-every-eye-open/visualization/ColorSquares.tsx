import React, { useRef } from "react";
import { SampleProvider } from "../../../audio/SampleProvider";
import { useSampleProviderTexture } from "../../../audio/useSampleProviderTexture";
import { ShaderImage } from "../../../ui/shader-image/ShaderImage";

export interface ColorSquaresProps {
  size: number;
  sampleProvider: SampleProvider;
  visibilityThreshold?: number;
  colorHigh?: [number, number, number];
  colorLow?: [number, number, number];
}

export const ColorSquares = ({ sampleProvider, size, visibilityThreshold, colorHigh = [1, 1, 1], colorLow = [0, 0, 0] }: ColorSquaresProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);
  const { current: imageUrls } = useRef({
    image: require('./color-squares.png'),
  });

  const getUniforms = () => {
    updateSampleTexture();
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      sampleDataAvg: { value: sampleProvider.getAvg()[0] / 255 },
      samplesActive: { value: sampleProvider.active ? 1 : 0 },
      visibilityThreshold: { value: visibilityThreshold ?? 0.5 },
      colorHigh: { value: colorHigh },
      colorLow: { value: colorLow },
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
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform float sampleDataAvg;
      uniform int samplesActive;
      uniform float visibilityThreshold;
      uniform vec3 colorHigh;
      uniform vec3 colorLow;
      in vec2 vUv;

      vec2 _max(sampler2D img, vec2 uv, float height) {
        // maxValue, maxValueRelevance
        vec2 d = vec2(0.0);
        for (float y = 0.; y <= height; y++) {
          vec4 value = texture2D(img, vec2(uv.x, y / height));
          if (value.r > d.s) {
            d.s = value.r;
            d.t =  1. - y / height;
          }
        }
        return d;
      }

      void main() {
        vec4 color = vec4(0.);
        if (samplesActive == 0) {
          color = texture2D(image, vUv);
        } else {
          float s = sampleDataSize.x;
          float sideLength = floor(sqrt(s));
          vec2 uv = vec2((floor(vUv.y * sideLength) * sideLength + floor(vUv.x * sideLength)) / s, 0.);
          vec2 texel = vec2((1. / sampleDataSize).x, 0.);
          vec2 value = _max(sampleData, uv, sampleDataSize.y); 
          // float currentValue = texture2D(sampleData, vec2(uv.x, 0)).r;      
          float topValue = _max(sampleData, uv + sideLength * texel, sampleDataSize.y).s;
          float rightValue = _max(sampleData, uv + texel, sampleDataSize.y).s;
          float bottomValue = _max(sampleData, uv - sideLength * texel, sampleDataSize.y).s;
          float leftValue = _max(sampleData, uv - texel, sampleDataSize.y).s;

          if (value.s >= max(max(topValue, rightValue), max(bottomValue, leftValue))) {
            vec3 baseColor = mix(colorLow, colorHigh, uv.x);
            float burn = floor(vUv.y * sideLength) / sideLength / 2.;
            float a = value.s >= visibilityThreshold ? value.t + .2 : 0.;
            color = vec4((value.s + burn) * baseColor, a);
          } else {
            color = vec4(0.0);
          }
        }
        gl_FragColor = color;
      }
    `}
  />;
};
