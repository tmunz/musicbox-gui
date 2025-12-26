import './VisualizationInfo.css';
import { Visualization } from './Visualization';

interface VisualizationInfoProps {
  visualization: Visualization | null;
  extended?: boolean;
}

export const VisualizationInfo = ({ visualization, extended = true }: VisualizationInfoProps) => {
  if (!visualization) {
    return <div>Selected visualization not found</div>;
  }

  return (
    <div className="visualization-info">
      {extended && (
        <>
          <h1>{visualization.title}</h1>
          <h2>
            <label>Artist</label>
            <span>{visualization.artist}</span>
            <label>Design</label>
            <span>{visualization.design}</span>
          </h2>
          <div className="visualization-selector-description">{visualization.description}</div>
        </>
      )}
      <div className={`visualization-cover-art ${extended ? 'visualization-cover-art-large' : ''}`}>
        <img src={visualization.imgSrc} alt={`Visualization: ${visualization.title}`} />
      </div>
    </div>
  );
};
