import { SampleProvider } from '../../../audio/SampleProvider';
import { DelacroixLibertyLeadingThePeopleSplashes } from './DelacroixLibertyLeadingThePeopleSplashes';

export interface VivaLaVidaProps {
  sampleProvider: SampleProvider;
  canvas: { width: number; height: number };
}

export const VivaLaVida = ({ sampleProvider, canvas }: VivaLaVidaProps) => {
  const sizeRatio = 0.9;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <DelacroixLibertyLeadingThePeopleSplashes
        width={canvas.width * sizeRatio}
        height={canvas.height * sizeRatio}
        sampleProvider={sampleProvider}
      />
    </div>
  );
};
