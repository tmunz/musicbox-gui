import { shaderMaterial } from "@react-three/drei";
import { extend, Object3DNode } from "@react-three/fiber";
import { ShaderMaterial, Texture } from "three";

extend({
  GlitterMaterial: shaderMaterial(
    {
      size: 1.0,
      textureImage: null,
      textureScale: 1.0,
    },
    ` 
      uniform float size;
      attribute vec2 textureOffset;
      varying vec2 vTextureOffset;
      varying float vRotation;
      varying float vSize;
      
      void main() {
        vTextureOffset = textureOffset;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = length(mvPosition.xyz);
        vSize = size / (dist * 0.01);
        gl_PointSize = vSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    `
      precision mediump float;
      varying vec2 vTextureOffset;
      varying float vRotation;
      varying float vSize;
      uniform sampler2D textureImage;
      uniform float textureScale;

      void main() {
        vec2 uv = gl_PointCoord * textureScale + vTextureOffset;
        float dist = length(gl_PointCoord - vec2(0.5, 0.5));
        if (dist > .5) {
          discard;
        }
        vec4 texColor = texture2D(textureImage,  uv);
        gl_FragColor = vec4(texColor.r * 1.3, texColor.g * 1.8, texColor.b * 1.8, 1.);
      }
    `,
  ),
});

export interface GlitterMaterial {
  size?: number;
  textureImage?: Texture;
  textureScale?: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      glitterMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & Partial<GlitterMaterial>;
    }
  }
}
