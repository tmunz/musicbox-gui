import React, { useRef } from 'react'
import { ShaderImage } from '../../../ui/shader-image/ShaderImage';
import { SampleProvider } from '../../../audio/SampleProvider';
import { useSampleProviderTexture } from '../../../audio/useSampleProviderTexture';
import { RootState } from '@react-three/fiber';
import { convertLeafData, convertWeightedMaxData, getBassValue } from './RoseDataConverter';
import { gaussianBlur } from '../../../utils/ShaderUtils';

export interface RoseProps {
  width: number;
  height: number;
  sampleProvider: SampleProvider;
  depth?: number;
  leafsPerBranch?: number;
}

export const Rose = ({ width, height, sampleProvider, depth = 2, leafsPerBranch = 3 }: RoseProps) => {

  const [sampleTexture, updateSampleTexture] = useSampleProviderTexture(sampleProvider);
  const [weightedMaxTexture, updateWeightedMaxTexture] = useSampleProviderTexture(sampleProvider, (sampleProvider) => convertWeightedMaxData(sampleProvider), () => 1);
  const [leafTexture, updateLeafTexture] = useSampleProviderTexture(sampleProvider, (sampleProvider) => convertLeafData(sampleProvider));

  const { current: imageUrls } = useRef({
    image: require('./rose.png'),
  });

  const getUniforms = (rootState: RootState) => {
    updateSampleTexture();
    updateWeightedMaxTexture();
    updateLeafTexture();
    const bassValue = getBassValue(sampleProvider);
    return {
      iTime: { value: rootState.clock.elapsedTime },
      sampleData: { value: sampleTexture },
      sampleDataSize: { value: { x: sampleTexture.image.width, y: sampleTexture.image.height } },
      weightedMaxData: { value: weightedMaxTexture },
      weightedMaxDataSize: { value: { x: weightedMaxTexture.image.width, y: weightedMaxTexture.image.height } },
      leafData: { value: leafTexture },
      leafDataSize: { value: { x: leafTexture.image.width, y: leafTexture.image.height } },
      bassValue: { value: bassValue },
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
      #define STROKE_WIDTH 0.005

      varying vec2 vUv;
      varying vec2 vSize;
      uniform float iTime;
      uniform sampler2D image;
      uniform sampler2D sampleData;
      uniform vec2 sampleDataSize;
      uniform sampler2D weightedMaxData;
      uniform vec2 weightedMaxDataSize;
      uniform sampler2D leafData;
      uniform vec2 leafDataSize;
      uniform float bassValue;
      uniform int depth;
      uniform int leafsPerBranch;

      const float leafScale = .18;
      const float blossomScale = .12;
      const float branchRatio = .5;
      const float angleOffset = radians(65.);
      const vec4 color1 = vec4(.525, .094, .098, 1.);
      const vec4 color2 = vec4(.9, .8, .75, 1.);
      const float spaceY = .1;

      ${ gaussianBlur }

      float _line(vec2 uv, vec2 a, vec2 b, float strokeWidth) {
        vec2 pa = uv - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        vec2 closestPoint = a + h * ba;
        float dist = length(uv - closestPoint);
        return smoothstep(strokeWidth, strokeWidth - .5 / max(vSize.x, vSize.y), dist);
      }

      vec4 _drawLine(vec4 c, vec4 color1, vec4 color2, vec2 uv, vec2 a, vec2 b, float strokeWidth) {
        c = mix(c, color1, _line(uv, a, b, strokeWidth));
        c = mix(c, color2, _line(uv, a, b, strokeWidth * .2));
        return c;
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
        float wave = uv.y * .05 * -sin(.8 - 8. * uv.x);
        return vec2((uv.x - .5) / (leafWidth + bottomRoundness) + .5, uv.y + wave);
      }

      vec2 _leafShape(vec2 uv) {
        float taperFactor = pow(clamp(uv.y, 0., 1.), .5);
        float leafWidth = .05 + mix(1., 0., taperFactor) * (pow(taperFactor, 4.)) * 12.;
        float x = (uv.x - .5) / leafWidth + .5;
        float y = uv.y - smoothstep(0., 1., abs(uv.x - .5));
        return vec2(x, y);
      }

      vec2 _transformUv(vec2 uv, vec2 p, float angle, float scale) {
        vec2 direction = vec2(sin(angle), cos(angle));
        vec2 leafUv = (uv - p) / scale + .5;
        leafUv -= direction * .5;
        return _rotatePoint(leafUv, vec2(.5), angle);
      }

      float _weightedMax(vec2 uv) {
        vec2 texelSize = 1.0 / weightedMaxDataSize;
        float y1 = floor(uv.y * weightedMaxDataSize.y) / weightedMaxDataSize.y;
        float y2 = y1 + texelSize.y;
        return mix(texture2D(weightedMaxData, vec2(uv.x, y1)), texture2D(weightedMaxData, vec2(uv.x, y2)), fract(uv.y * weightedMaxDataSize.y)).r;
      }

      float _value(vec2 uv) {
        return texture2D(sampleData, uv).r;
      }

      vec4 rose(vec2 uv) {        
        vec4 c = vec4(0.);
        float baseLength = (1. - 2. * spaceY) / ((float(depth + 3) + blossomScale));
        float leafs = float(depth * leafsPerBranch);
        vec2 current = vec2(.5, spaceY);
        vec2 mainEnd;

        for (int d = 0; d < depth; d++) {
          float mainAngle = 0.;
          mainEnd = current + baseLength * vec2(sin(mainAngle), cos(mainAngle));
          c = _drawLine(c, color1, color2, uv, current, mainEnd, STROKE_WIDTH);
          current = mainEnd;
          float branchAngle = (float(d % 2) * 2. - 1.) * angleOffset;
          vec2 branchVector = baseLength * branchRatio * vec2(sin(branchAngle), cos(branchAngle));
          vec2 branchEnd = current + branchVector;
          c = _drawLine(c, color1, color2, uv, current, branchEnd, STROKE_WIDTH);
          float direction = current.x < branchEnd.x ? -1. : 1.;

          for (int b = 0; b < leafsPerBranch; b++) {
            float leaf = direction * (-1. + 2. * float(b) / float(2));
            vec2 leafBranch = current + branchVector * (.5 + .5 * (1. - abs(sin(leaf - 0.33))));
            float leafAngle = leaf * angleOffset;
            vec2 leafStart = leafBranch + 0.02 * vec2(sin(branchAngle + leafAngle), cos(branchAngle + leafAngle));
            c = _drawLine(c, color1, color2, uv, leafBranch, leafStart, STROKE_WIDTH);
            vec2 leafUv = _leafShape(_transformUv(uv, leafStart, branchAngle + leafAngle, leafScale));
            for (int side = 0; side < 2; side++) {
              float leafValueY = (leafUv.y + float((d * leafsPerBranch + b) * 2 + side)) / (leafs * 2.);
              float leafValueX = (leafUv.x - .5) / (.5 + .5 * _weightedMax(vec2(0., leafValueY))) + .5;
              vec2 leafValueUv = vec2(1. - abs(float((d + side) % 2) - leafValueX), leafValueY);
              // vec2 leafDataUv = vec2((leafUv.y + float((d * leafsPerBranch + b))) / leafs, leafValueUv.x);
              vec2 leafSideUv = vec2(((d + side) % 2 == 0 ? leafValueX : 1. - leafValueX) * 2., leafUv.y);
              float maskX = smoothstep(0., 1. / vSize.x, leafSideUv.x) * smoothstep(1., 1. - 1. / vSize.x, leafSideUv.x);
              float maskY = smoothstep(0., 1. / vSize.y, leafSideUv.y) * smoothstep(1., 1. - 1. / vSize.y, leafSideUv.y);
              float value = gaussianBlur(leafData, leafValueUv.yx, .1, 9, leafDataSize).r; 
              float v = smoothstep(.5, .6, value);
              c = mix(c, mix(color1, color2, v), maskX * maskY);
            }
          }
        }
 
        float mainAngle = 0.;
        mainEnd = current + 2. * baseLength * vec2(sin(mainAngle), cos(mainAngle));
        c = _drawLine(c, color1, color2, uv, current, mainEnd, STROKE_WIDTH);
        vec2 blossomUv = _blossomShape(_transformUv(uv, mainEnd, mainAngle, blossomScale));
        float maskX = smoothstep(0., 1. / vSize.x, blossomUv.x) * smoothstep(1. + 1. / vSize.x, 1., blossomUv.x);
        float maskY = smoothstep(0., 1. / vSize.y, blossomUv.y) * smoothstep(1. + 1. / vSize.y, 1., blossomUv.y);
        c = mix(c, color1, maskX * maskY);
        return c;
      }

      void main() {
        vec2 uv = vUv;
        gl_FragColor = rose(uv);  
      }
    `}
  />;
}

