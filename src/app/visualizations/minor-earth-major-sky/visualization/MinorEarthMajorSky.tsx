import { SampleProvider } from '../../../audio/SampleProvider';
import { PlaneInDesert } from './PlaneInDesert';

export interface MinorEarthMajorSkyProps {
  sampleProvider: SampleProvider;
  canvas: { width: number; height: number };
  intensity?: number;
}

export const MinorEarthMajorSky = ({ sampleProvider, canvas, intensity }: MinorEarthMajorSkyProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <PlaneInDesert
        width={canvas.width}
        height={canvas.height}
        sampleProvider={sampleProvider}
        intensity={intensity}
      />
    </div>
  );
};
