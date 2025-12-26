import { SampleProvider } from '../../../audio/SampleProvider';
import { ColorSquares } from './ColorSquares';

export interface ChvrchesEveryOpenEyeProps {
  sampleProvider: SampleProvider;
  canvas: { width: number; height: number };
  visibilityThreshold?: number;
  backgroundImage?: number;
}

export const ChvrchesEveryOpenEye = (props: ChvrchesEveryOpenEyeProps) => {
  const size = Math.min(props.canvas.width, props.canvas.height) * 0.8;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <ColorSquares size={size} {...props} />
    </div>
  );
};
