import { useRef } from 'react';
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';
import { convertWaterData } from './WaterDataConverter';

export interface MoonLightSceneProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
}

export const MoonLightScene = ({ width, height, sampleProvider }: MoonLightSceneProps) => {
  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider, convertWaterData);

  const { current: imageUrls } = useRef({
    image: require('./moon_light_scene.png'),
  });

  const getUniforms = () => {
    updateSampleTexture();
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      sampleDataAvg: { value: sampleProvider.getAvg()[0] / 255 },
      samplesActive: { value: sampleProvider.active ? 1 : 0 },
    };
  };

  return (
    <ShaderImage
      imageUrls={imageUrls}
      objectFit="contain"
      width={width}
      height={height}
      getUniforms={getUniforms}
      vertexShader={` 
        varying vec2 vUv;
        varying vec2 vPosition;
        varying vec2 vSize;
        
        void main() {
          vUv = uv;
          vSize = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
          vPosition = vec2(position + 0.5) * vSize;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
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

        float _value(vec2 uv) {
          float g = 1.5;
          float topLeft = pow(texture2D(sampleData, uv).r, g);
          float topRight = pow(texture2D(sampleData, uv + vec2(1. / sampleDataSize.x, 0.)).r, g);;
          float bottomLeft = pow(texture2D(sampleData, uv + vec2(0., 1. / sampleDataSize.y)).r, g);;
          float bottomRight = pow(texture2D(sampleData, uv + vec2(1. / sampleDataSize.x, 1. / sampleDataSize.y)).r, g);;

          vec2 f = fract(uv * sampleDataSize);

          float topInterp = mix(topLeft, topRight, f.x);
          float bottomInterp = mix(bottomLeft, bottomRight, f.x);
          return mix(topInterp, bottomInterp, f.y);
        }

        void main( ) {
          vec2 uv = vUv;
          float horizon = .2;
          float foreground = .06;
          float h = horizon - foreground;
          vec2 perspectiveOffset = vec2(.02, .08);
          float wx = (.5 + perspectiveOffset.x) + (uv.x - .5 - perspectiveOffset.x) / (horizon + perspectiveOffset.y - uv.y) * perspectiveOffset.y;
          float wy = pow((uv.y - foreground) / h, 2.);
          vec2 perspectiveUv = vec2(wx, wy);
          float value = _value(perspectiveUv.yx);
          vec4 waterColor = vec4(mix(vec3(.276, .549, .357), vec3(.851, .894, .729), value), 1.);
          vec4 imageColor = texture(image, uv);
          vec2 shadowBoundary = vec2(.443, .565) + value * .01;
          if (imageColor.a < .5 && shadowBoundary.s < perspectiveUv.x && perspectiveUv.x < shadowBoundary.t) {
            waterColor = mix(waterColor, vec4(.276, .549, .357, 1.), 0.5);
          }
          gl_FragColor = mix(waterColor, imageColor, imageColor.a);
        }
      `}
    />
  );
};
