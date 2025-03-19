import React, { useRef } from 'react'
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';
import { convertRoseLeafData } from './RoseLeafsConverter';

export interface RoseProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
  numberOfLeafs?: number;
}

export const Rose = ({ width, height, sampleProvider, numberOfLeafs = 4 }: RoseProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider, (sampleProvider) => convertRoseLeafData(sampleProvider, numberOfLeafs), () => 1);

  const { current: imageUrls } = useRef({
    image: require('./rose.png'),
  });

  const getUniforms = () => {
    updateSampleTexture();
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
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
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;   
        vec2 leafUv = vec2(-.5 + uv.x, -.2 + uv.y) * 2.;
        vec4 color = texture2D(image, uv);
        float shapeEffect = 0.;

        for (float y = 0.; y < sampleDataSize.y; y++) {
          vec2 sampleUv = vec2(0., y / sampleDataSize.y);
          float value = texture2D(sampleData, sampleUv).r;
          if (value > .01) {
            float angle = .4; // value * 3.14;
            mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            vec2 rotatedUv = rotationMatrix * (leafUv - sampleUv) + sampleUv;
            
            float size = value * 0.1;
            float taperFactor = clamp((rotatedUv.y - sampleUv.y) / size * 0.3, 0.0, 1.0);
            taperFactor = pow(taperFactor, 0.5); // Less power = sharper bottom
            float leafWidth = size * (1.0 - pow(taperFactor, 4.0));
            leafWidth *= mix(0.1, 1.0, taperFactor);
            float shape = smoothstep(leafWidth * 2.0, leafWidth, abs(rotatedUv.x - sampleUv.x)) * taperFactor;
            
            shapeEffect = max(shapeEffect, shape);
          }
        }

        color = clamp(color + vec4(step(0.01, shapeEffect)), 0., 1.);

        gl_FragColor = color;
      }
    `}
  />;
}
