import React from "react";
import { ShaderImageThree } from "./ShaderImageThree";
import { DEFAULT_IMAGE, ShaderImageProps } from "./ShaderImageUtils";

export const ShaderImage = (props: ShaderImageProps & { color?: string, shaderDisabled?: boolean, width: number | string, height: number | string }) => {

  return <div className='shader-image' style={{ backgroundColor: props.color ?? 'none', position: 'relative', width: props.width, height: props.height }}>
    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, opacity: props.shaderDisabled ? 0 : 1 }}>
      <ShaderImageThree {...props} />
    </div>
    <img src={props.imageUrls[DEFAULT_IMAGE]} style={{ width: '100%', height: '100%', objectFit: props.objectFit ?? 'cover' }} />
  </div>;
}