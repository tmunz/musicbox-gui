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
      
      varying vec2 vSize;
      uniform sampler2D image;
      uniform sampler2D imageFlat;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform float sampleDataAvg;
      uniform int samplesActive;
      in vec2 vUv;

      float magicBox(vec3 p, float t) {
        float c = sin(1. + fract(0.7971) * t * 1.2);
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
        vec2 uv = vUv - 0.5;
        vec4 color = texture2D(image, vUv);
        float aspect = sampleDataSize.x / sampleDataSize.y;

        float a = 0.0;
        if (uv.x >= 0.) a = -atan(uv.x, uv.y) * 1.66;
        if (uv.x < 0.) a = atan(uv.x, uv.y) * 0.275;
        float fc = magicBox(vec3(uv, a), sampleDataAvg) + 1.; 

        float centerSplashSize = 1. * .5;  
        float aspectRatio = vSize.x / vSize.y;
        vec2 scaledUV = vec2(uv.x * aspectRatio, -uv.y);
        float r = length(scaledUV) / centerSplashSize;
        float theta = atan(scaledUV.y, scaledUV.x);

        float scaledTheta = (theta + 3.1416) / (2. * 3.1416) * sampleDataSize.x;
        float thetaFraction = fract(scaledTheta);
        float thetaInteger = floor(scaledTheta);

        vec2 polarUV = vec2(thetaInteger / sampleDataSize.x, clamp(r, 0., 1.)); 
        vec2 curr = _max(sampleData, 1. - polarUV.x, sampleDataSize.y);
        float currValue = curr.s * curr.t;
        // currValue = texture(sampleData, vec2(1. - polarUV.x, polarUV.y)).r;

        vec2 nextPolarUV = vec2((thetaInteger + 1.) / sampleDataSize.x, clamp(r, 0., 1.));
        if (nextPolarUV.x >= 1.0) {
            nextPolarUV.x -= 1.0;
        }
        vec2 next = _max(sampleData, 1. - nextPolarUV.x, sampleDataSize.y);
        float nextValue = next.s * next.t;
        // nextValue = texture(sampleData, vec2(1. - nextPolarUV.x, nextPolarUV.y)).r;

        float value = mix(currValue, nextValue, smoothstep(0., 1., thetaFraction));

        r += 1. - (.5 * value + .5 * sampleDataAvg);
        polarUV = vec2((theta + 3.1416) / (2.0 * 3.1416), clamp(r, 0., 1.));
    
        if (0. <= polarUV.x && polarUV.x < 1. && 0. <= polarUV.y && polarUV.y < 1.) {
          value = texture(sampleData, 1. - polarUV).r;
          color = mix(vec4(1.), color, 0.); // * magicBox(vec3(uv, a)

          // float cornerSplashSize = (1. - sampleDataAvg) * 5.;
          // vec3 cornerSplash = vec3(smoothstep(fc, fc + 0.001, 1.0 / dot(uv, uv) * cornerSplashSize));
          // color = mix(vec4(color.rgb, 1.), 1. - vec4(cornerSplash, 0.), 1. - cornerSplash.r);
        }
        gl_FragColor = color;
      }
    `}
  />;
};
