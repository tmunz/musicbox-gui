import { Pulsar } from './Pulsar';
import { SampleProvider } from '../../../audio/SampleProvider';

export interface UnknownPleasuresProps {
  sampleProvider: SampleProvider;
  canvas: { width: number; height: number };
}

export const UnknownPleasures = ({ sampleProvider, canvas }: UnknownPleasuresProps) => {
  const sizeRatio = 0.6;
  const sideRatio = 7 / 10;
  const width = Math.floor(Math.min(canvas.width, canvas.height * sideRatio) * sizeRatio);
  const height = Math.floor(Math.min(canvas.width / sideRatio, canvas.height) * sizeRatio);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Pulsar width={width} height={height} sampleProvider={sampleProvider} />
    </div>
  );
};
