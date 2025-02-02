import './VisualizationInfo.css';
import React from 'react';
import { Visualization } from './Visualization';

interface VisualizationInfoProps {
  visualization: Visualization;
}

export const VisualizationInfo = ({ visualization }: VisualizationInfoProps) => {

  if (!visualization) {
    return <div>Selected visualization not found</div>;
  }

  return (
    <div className='visualization-info'>
      <h1>{visualization.title}</h1>
      <h2>
        <label>Artist</label><span>{visualization.artist}</span>
        <label>Design</label><span>{visualization.design}</span>
      </h2>
      <div className='visualization-selector-description'>
        {visualization.description}
      </div>
      <div className='visualization-cover-art'>
        <img
          src={visualization.imgSrc}
          alt={`Visualization: ${visualization.title}`}
        />
      </div>
    </div >
  );
};
