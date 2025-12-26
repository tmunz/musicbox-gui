import { Cat } from './Cat';
import { SampleProvider } from '../../../audio/SampleProvider';

export interface KarpatenhundProps {
  sampleProvider: SampleProvider;
  canvas: { width: number; height: number };
}

export const Karpatenhund = ({ sampleProvider, canvas }: KarpatenhundProps) => {
  const sizeRatio = 0.8;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Cat width={canvas.width * sizeRatio} height={canvas.height * sizeRatio} sampleProvider={sampleProvider} />
    </div>
  );
};
