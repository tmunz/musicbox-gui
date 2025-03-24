import React, { useRef } from 'react'
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';
import { RootState } from '@react-three/fiber';
import { convertRoseLeafData } from './RoseLeafsConverter';

export interface RoseProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
  depth?: number;
  leafsPerBranch?: number;
}

export const Rose = ({ width, height, sampleProvider, depth = 2, leafsPerBranch = 3 }: RoseProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider, (sampleProvider) => convertRoseLeafData(sampleProvider), () => 1);

  const { current: imageUrls } = useRef({
    image: require('./rose.png'),
  });

  const getUniforms = (rootState: RootState) => {
    updateSampleTexture();
    return {
      iTime: { value: rootState.clock.elapsedTime },
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      depth: { value: depth },
      leafsPerBranch: { value: leafsPerBranch },
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
      #define PI 3.14159
      #define STROKE_WIDTH 3.

      varying vec2 vUv;
      varying vec2 vSize;
      uniform float iTime;
      uniform sampler2D image;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform int depth;
      uniform int leafsPerBranch;

      const float leafScale = .18;
      const float blossomScale = .12;
      const float branchRatio = .5;
      const float angleOffset = radians(65.);
      const vec4 color1 = vec4(.525, .094, .098, 1.);
      const vec4 color2 = vec4(.9, .9, .9, 1.);
      const float spaceY = .1;

      float _line(vec2 uv, vec2 a, vec2 b, float strokeWidth) {
        vec2 pa = uv - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        vec2 closestPoint = a + h * ba;
        float dist = length(uv - closestPoint);
        return smoothstep(strokeWidth, strokeWidth - .5 / vSize.y, dist);
      }

      vec2 _rotatePoint(vec2 v, vec2 pivot, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        v -= pivot;
        return vec2(v.x * c - v.y * s, v.x * s + v.y * c) + pivot;
      }

      vec2 _blossomShape(vec2 uv) {
        float taperFactor = pow(clamp(uv.y, 0., 1.), 5.);
        float leafWidth = pow(.5, 2.) * (1. - pow(taperFactor, 1.)) * mix(.08, 1., taperFactor) * 12.;
        float bottomRoundness = smoothstep(.0, .9, pow(uv.y, .3)) * .6;
        float wave = uv.y * .05 * sin(.8 - 8. * uv.x);
        return vec2((uv.x - 0.5) / (leafWidth + bottomRoundness) + 0.5, uv.y + wave);
      }

      vec2 _leafShape(vec2 uv) {
        float taperFactor = pow(clamp(uv.y, 0., 1.), .5);
        float leafWidth = .05 + mix(1., 0., taperFactor) * (pow(taperFactor, 4.)) * 8.;
        return vec2((uv.x - 0.5) / leafWidth + 0.5, uv.y);
      }

      vec2 _transformUv(vec2 uv, vec2 p, float angle, float scale) {
        vec2 direction = vec2(sin(angle), cos(angle));
        vec2 leafUv = (uv - p) / scale + .5;
        leafUv -= direction * .5;
        return _rotatePoint(leafUv, vec2(.5), angle);
      }

      float _wind(int p) {
        return 0.05 * sin(iTime + float(p));
      }

      vec4 rose(vec2 uv) {        
        vec4 c = vec4(0.);
        float baseLength = (1. - 2. * spaceY) / ((float(depth + 3) + blossomScale));
        float leafs = float(depth * leafsPerBranch);
        vec2 current = vec2(.5, spaceY);
        vec2 mainEnd;

        for (int d = 0; d < depth; d++) {
          float mainAngle = float(_wind(d));
          mainEnd = current + baseLength * vec2(sin(mainAngle), cos(mainAngle));
          c = mix(c, color1, _line(uv, current, mainEnd, STROKE_WIDTH / vSize.y));
          current = mainEnd;
          float branchAngle = (float(d % 2) * 2. - 1.) * angleOffset + _wind(d + 1);
          vec2 branchVector = baseLength * branchRatio * vec2(sin(branchAngle), cos(branchAngle));
          vec2 branchEnd = current + branchVector;
          c = mix(c, color1, _line(uv, current, branchEnd, STROKE_WIDTH / vSize.y));
          float direction = current.x < branchEnd.x ? -1. : 1.;

          for (int b = 0; b < leafsPerBranch; b++) {
            float leaf = direction * (-1. + 2. * float(b) / float(2));
            vec2 leafBranch = current + branchVector * (.5 + .5 * (1. - abs(sin(leaf - 0.33))));
            float leafAngle = leaf * angleOffset + _wind(d + b);
            vec2 leafStart = leafBranch + 0.02 * vec2(sin(branchAngle + leafAngle), cos(branchAngle + leafAngle));
            c = mix(c, color1, _line(uv, leafBranch, leafStart, STROKE_WIDTH / vSize.y));
            vec2 leafUv = _leafShape(_transformUv(uv, leafStart, branchAngle + leafAngle, leafScale));
            vec2 leafValueUv = vec2(leafUv.x, (leafUv.y + float(d * leafsPerBranch + b)) / leafs);
            float value = texture2D(sampleData, leafValueUv).r;
            leafUv = vec2((leafUv.x - .5) / (.5 + .5 * value) + .5, leafUv.y);
            if (all(greaterThanEqual(leafUv, vec2(0.))) && all(lessThanEqual(leafUv, vec2(1.)))) {
              c = color1;
            }
          }
        }
 
        float mainAngle = float(_wind(depth));
        mainEnd = current + 2. * baseLength * vec2(sin(mainAngle), cos(mainAngle));
        c = mix(c, color1, _line(uv, current, mainEnd, STROKE_WIDTH / vSize.y));
        vec2 blossomUv = _blossomShape(_transformUv(uv, mainEnd, mainAngle, blossomScale));
        if (all(greaterThanEqual(blossomUv, vec2(0.))) && all(lessThanEqual(blossomUv, vec2(1.)))) {
          c = color1;
        }

        return c;
      }

      void main() {
        vec2 uv = vUv;
        gl_FragColor = rose(uv);  
      }
    `}
  />;
}


// mat3 rotate(float angle) {
//   float c = cos(angle);
//   float s = sin(angle);
//   return mat3(vec3(c, s, 0), vec3(-s, c, 0), vec3(0, 0, 1)); 
// }

// mat3 translate(vec2 t) {
//   return mat3(vec3(1, 0, 0), vec3(0, 1, 0), vec3(-t, 1)); 
// }

        // vec2 transformedPoint = (rotate(radians(30.0)) * translate(vec2(.55, .69)) * vec3(uv, 1.)).xy;

        // int maxIterations = int(pow(float(branches), float(depth))); 
        // float minDistance = 1.0;

        // int iteration = 0;
        // for (int count = 0; count <= 100; ++count) {
        //   int segmentOffset = int(pow(float(branches), float(depth)));
        //   vec2 currentPoint = startPoint;

        //   for (int level = 1; level <= depth; ++level) {
        //     float segmentLength = 1.0 / pow(1. / lengthRatio, float(level));            
        //     segmentOffset /= branches; 

        //     int branchIndex = iteration / segmentOffset;
        //     float branchOffset = float(branchIndex % branches) - (float(branches) - 1.0) / 2.0; 
          
        //     mat3 windEffect = rotate(0.2 * sin(iTime + (branchOffset == 1.0 ? PI * 2.0 : 1.0)));
        //     mat3 positionTransform = translate(vec2(0, branchOffset == 0.0 ? -4.0 * segmentLength : -2.0 * segmentLength));
        //     mat3 transformMatrix = windEffect * rotate(branchOffset * angle * PI / 180.0) * positionTransform;

        //     currentPoint = (transformMatrix * vec3(currentPoint, 1)).xy;
        //     float distanceToLine = line_(currentPoint, vec2(strokeWidth, segmentLength));   

        //     if (distanceToLine - 2.0 * segmentLength > 0.0) { 
        //       iteration += segmentOffset - 1; 
        //       break;
        //     }
        //     minDistance = min(minDistance, distanceToLine);
        //   } 

        //   iteration++;
        //   if (iteration > maxIterations) break;
        // }
        
        // return 1. - min(minDistance, line_(startPoint, vec2(strokeWidth, 1.))) * 50.; 
