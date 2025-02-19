import React from 'react';
import { SampleProvider } from '../../../audio/SampleProvider';
import { ColorSquares } from './ColorSquares';

export interface ChvrchesEveryEyeOpenProps {
  sampleProvider: SampleProvider;
  canvas: { width: number, height: number };
  visibilityThreshold?: number;
}

export const ChvrchesEveryEyeOpen = (props: ChvrchesEveryEyeOpenProps) => {
  const size = Math.min(props.canvas.width, props.canvas.height) * 0.8;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <ColorSquares size={size} {...props} colorHigh={[0.937, 0.690, 0.722]} colorLow={[0.627, 0.635, 0.698]} />
    </div>
  );
}
