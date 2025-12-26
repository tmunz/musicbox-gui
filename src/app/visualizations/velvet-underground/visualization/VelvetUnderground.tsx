import { Suspense } from 'react';
import { Bananas } from './Bananas';
import { Overlay } from './Overlay';
import { SampleProvider } from '../../../audio/SampleProvider';

export interface VelvetUndergroundProps {
  sampleProvider: SampleProvider;
  canvas: { width: number; height: number };
}

export const VelvetUnderground = (props: VelvetUndergroundProps) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Suspense fallback={null}>
        <Bananas sampleProvider={props.sampleProvider} />
      </Suspense>
      <Overlay />
    </div>
  );
};
