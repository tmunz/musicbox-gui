import React, { useRef } from "react";
import { SampleProvider } from "../../../audio/SampleProvider";
import { useSampleProviderTexture } from "../../../audio/useSampleProviderTexture";
import { ShaderImage } from "../../../ui/shader-image/ShaderImage";

export interface DelacroixLibertyLeadingThePeopleSplashesProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
}

export const DelacroixLibertyLeadingThePeopleSplashes = ({ sampleProvider, width, height }: DelacroixLibertyLeadingThePeopleSplashesProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);
  const { current: imageUrls } = useRef({
    image: require('./delacroix-liberty-leading-the-people.jpg'),
  });

  const getUniforms = () => {
    updateSampleTexture();
    return {
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      sampleDataAvg: { value: sampleProvider.getAvg()[0] / 255 },
      samplesActive: { value: sampleProvider.active ? 1 : 0 },
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

      float magicBox(vec3 p) {
        float c = sin(1. + fract(0.7971) * sampleDataAvg * 1.2);
        p = 1. - abs(1. - mod(p, 2.));
        float lL = length(p), tot = 0.;
        for (int i = 0; i < 13; i++) {
          p = abs(p) / (lL * lL) - c;
          float nL = length(p);
          tot += abs(nL - lL);
          lL = nL;
        }
        return tot;
      }

      void main() {
        vec2 uv = vUv - 0.5;
        vec3 color = texture2D(image, vUv).rgb;

        float a = 0.0;
        if (uv.x >= 0.) a = -atan(uv.x, uv.y) * 1.66;
        if (uv.x < 0.) a = atan(uv.x, uv.y) * 0.275;
        float fc = magicBox(vec3(uv, a)) + 1.; 

        float centerSplashSize = pow(sampleDataAvg, 4.) * .4;   
        vec3 centerSplash = vec3(smoothstep(fc, fc + 0.001, 1.0 / dot(uv, uv) * centerSplashSize));
        color = mix(color, centerSplash, centerSplash.r);

        float cornerSplashSize = (1. - sampleDataAvg) * 5.;
        vec3 cornerSplash = vec3(smoothstep(fc, fc + 0.001, 1.0 / dot(uv, uv) * cornerSplashSize));
        color = mix(color, 1. - cornerSplash, 1. - cornerSplash.r);

        gl_FragColor = vec4(color, 1.);
      }
    `}
  />;
};
