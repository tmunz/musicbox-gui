import React, { useRef } from 'react'
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
      samplesActive: { value: sampleProvider.active ? 1 : 0 }
    }
  };

  return <ShaderImage
    imageUrls={imageUrls}
    objectFit='contain'
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
        float topLeft = texture2D(sampleData, uv).r;
        float topRight = texture2D(sampleData, uv + vec2(1. / sampleDataSize.x, 0.)).r;
        float bottomLeft = texture2D(sampleData, uv + vec2(0., 1. / sampleDataSize.y)).r;
        float bottomRight = texture2D(sampleData, uv + vec2(1. / sampleDataSize.x, 1. / sampleDataSize.y)).r;
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
  />;
}

// void main() {
//   vec2 uv = vUv;
//   float a = 0.;
//   float yu = .2;
//   float yl = .06;
//   float h = yu - yl;
//   float lines = sampleDataSize.x;
//   float distance = h / (lines - 1.);

//   for (float i = 1.; i <= lines; i++) {
//     float currLine = lines - i; // from top to bottom
//     float value = _value(vec2(currLine/lines, uv.x)) * (1. - h) * 0.01;
//     float d = uv.y - value - currLine * distance - yl;
//     float strokeWidth = (1. - uv.y / (h + .1)) / vSize.y * 10.;
//     a += min(1. - smoothstep(strokeWidth * .5, strokeWidth, d), 1.); // upper line edge
//     a *= smoothstep(0., strokeWidth * .5, d); // lower line edge and mask
//   }
//   vec4 imageColor = texture(image, uv);
//   vec4 waterBaseColor = texture(waterImage, vec2(uv.x, uv.y / h - .5));
//   vec4 waterColor = mix(waterBaseColor, mix(vec4(.376, .749, .557, 1.), vec4(.851, .894, .729, 1.), a), .0);
//   gl_FragColor = mix(waterColor, imageColor, imageColor.a); 
// }