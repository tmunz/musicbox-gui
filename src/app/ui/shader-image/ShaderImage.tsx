import React, { Suspense } from 'react';
import { DEFAULT_IMAGE, ShaderImageThreeProps, ShaderImageThree } from './ShaderImageThree';

export const ShaderImage = (props: ShaderImageThreeProps & { color?: string, shaderDisabled?: boolean, width: number | string, height: number | string }) => {

  const style = { width: '100%', height: '100%', objectFit: props.objectFit ?? 'contain' };

  return <div className='shader-image' style={{ backgroundColor: props.color ?? 'none', position: 'relative', width: props.width, height: props.height }}>
    <Suspense fallback={props.imageUrls?.[DEFAULT_IMAGE] ? <img src={props.imageUrls[DEFAULT_IMAGE]} style={style} /> : null}>
      <ShaderImageThree style={style} {...props} />
    </Suspense>
  </div>;
}