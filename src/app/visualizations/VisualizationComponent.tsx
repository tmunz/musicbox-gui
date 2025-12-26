import './VisualizationComponent.css';
import { Visualization } from './Visualization';
import { SampleProvider } from '../audio/SampleProvider';
import { useFade } from '../utils/useFade';
import { CAROUSEL_TRANSITION_DURATION_MS } from '../ui/carousel/CarouselConstants';

interface VisualizationComponentProps {
  visualization: Visualization | null;
  sampleProvider: SampleProvider;
  canvas: { width: number; height: number };
  isActive: boolean;
}

export const VisualizationComponent = ({
  visualization,
  sampleProvider,
  canvas,
  isActive,
}: VisualizationComponentProps) => {
  const { visible, fadeStyle } = useFade(isActive, CAROUSEL_TRANSITION_DURATION_MS * 1);

  return (
    <div className="visualization-component" style={{ backgroundColor: visualization?.color }}>
      <div style={fadeStyle}>
        {visualization && visible && (
          <visualization.component
            sampleProvider={sampleProvider}
            canvas={canvas}
            {...Object.fromEntries(
              Object.entries(visualization.settings?.visualization || {}).map(([key, setting]) => [key, setting.value])
            )}
          />
        )}
      </div>
    </div>
  );
};
