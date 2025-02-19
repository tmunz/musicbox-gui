import React, { useRef } from 'react'
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';

export interface CatProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
}

export const Cat = ({ width, height, sampleProvider }: CatProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);
  const { current: imageUrls } = useRef({
    image: require('./karpatenhund_3_cat_full_orig.png'),
    imageFlat: require('./karpatenhund_3_cat_full_flat.png'),
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
      uniform sampler2D imageFlat;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform float sampleDataAvg;
      uniform int samplesActive;
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

      float _shapeFactor (float x) {
        return 0.9 * (cos(12. * x) / 3.0 + .5) * (1. - x / 2.) + 0.1;
      }

      void main() {
        vec4 color;
        vec2 uv = vUv;

        if (samplesActive == 0) {
          color = texture(image, uv);
        } else {
          float baseY = 0.1;
          float avgFactor = 0.1;
          float dataX0 = 0.0;
          float dataX1 = 1.0;
          float dataY0 = 0.5;
          float dataY1 = 0.8;
          if (dataX0 <= uv.x && uv.x <= dataX1 && dataY0 <= uv.y) {
            float dateWidth = dataX1 - dataX0;
            float dataHeight = dataY1 - dataY0;
            vec2 correctedUv = (uv - vec2(dataX0, dataY0)) / vec2(dateWidth, dataHeight);
            vec4 sampleColor = _gaussianBlur(sampleData, correctedUv, 1. / sampleDataSize.x, 25, sampleDataSize);
            float factor = dataHeight;
            uv.y -= sampleColor.r * factor * _shapeFactor(uv.x) * correctedUv.y;
            // sampleColor.rgb = vec3(sampleColor.r);
            // color = sampleColor;
          }

          uv.y -= sampleDataAvg * clamp(uv.y - baseY, 0., dataY0 - baseY) * avgFactor;
          color = texture(imageFlat, uv);
        }
        gl_FragColor = color;
      }
    `}
  />;
}