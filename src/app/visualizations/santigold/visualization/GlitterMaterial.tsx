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
      
      void main() {
        vTextureOffset = textureOffset;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = length(mvPosition.xyz);
        gl_PointSize = size / (dist * 0.01);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    `
      precision mediump float;
      varying vec2 vTextureOffset;
      uniform sampler2D textureImage;
      uniform float textureScale;

      void main() {
        vec2 uv = gl_PointCoord * textureScale + vTextureOffset;
        vec4 texColor = texture(textureImage, uv);
        gl_FragColor = texColor;
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
