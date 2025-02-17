import React, { useMemo } from 'react'
import { ShaderImage } from './shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { DataTexture, RedFormat, UnsignedByteType, Vector2 } from 'three';

export interface CatProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider; // UInt8[][] -- [sampleOverTime][frequencyBands as 0-255]
}

export const Cat = ({ width, height, sampleProvider }: CatProps) => {

  const imageUrls = useMemo(() => ({
    image: require('./karpatenhund_3_cat_full_orig.png'),
    imageFlat: require('./karpatenhund_3_cat_full_flat.png'),
  }), []);

  const getUniforms = () => {
    const dataWidth = sampleProvider.get(0).length;
    const dataHeight = sampleProvider.getFullSize();
    const textureData = new Uint8Array(dataWidth * dataHeight);
    for (let i = 0; i < sampleProvider.getFullSize(); i++) {
      textureData.set(sampleProvider.get(i), i * dataWidth);
    }
    const sampleTexture = new DataTexture(textureData, dataWidth, dataHeight, RedFormat, UnsignedByteType);
    sampleTexture.needsUpdate = true;
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: new Vector2(dataWidth, dataHeight) },
      animationActive: { value: 1 }
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
      uniform sampler2D imageFlat;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform int animationActive;
      in vec2 vUv;

      vec4 _gaussianBlur(sampler2D img, vec2 uv, float blurSize, int kernelSize, vec2 resolution) {
        vec4 color = vec4(0.0);
        int halfKernelSize = kernelSize / 2;
        float sigma = float(kernelSize) / 2.0;
        float weightSum = 0.0;
        for (int x = -halfKernelSize; x <= halfKernelSize; x++) {
          for (int y = -halfKernelSize; y <= halfKernelSize; y++) {
            vec2 offset = vec2(x, y) * blurSize / resolution;
            float weight = exp(-(float(x * x + y * y) / (2.0 * sigma * sigma))); 
            color += texture2D(img, uv + offset) * weight;
            weightSum += weight;
          }
        }
        return color / weightSum;  
      }

      void main() {
        vec4 color;
        vec2 uv = vUv;

        if (animationActive == 0) {
          color = texture(image, uv);
        } else {
          float startX = 0.0;
          float endX = 1.0;
          float startY = 0.5;
          float endY = 0.8;

          if (startX < uv.x && uv.x < endX && startY < uv.y && uv.y < endY) {
            float dateWidth = endX - startX;
            float dataHeight = endY - startY;
            vec2 correctedUv = (uv - vec2(startX, startY)) / vec2(dateWidth, dataHeight);
            vec4 sampleColor = _gaussianBlur(sampleData, correctedUv, 1. / sampleDataSize.x, 25, sampleDataSize);
            float factor = 0.2; // (endX - uv.x) * dataHeight;
            uv.y += -sampleColor.r * factor * correctedUv.y;
            color = texture(imageFlat, uv);
            // sampleColor.rgb = vec3(sampleColor.r);
            // color = sampleColor;
          } else {
            color = texture(imageFlat, uv);
          }
        }
        gl_FragColor = color;
      }
    `}
  />;
}