import './VisualizationSelector.css';
import React, { useState } from 'react';
import { Visualization } from './Visualization';

interface VisualizationSelectorProps {
  visualizations: Visualization[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

export const VisualizationSelector = ({ visualizations, onSelect, selectedId }: VisualizationSelectorProps) => {

  const visualization = visualizations.find((v) => v.id === selectedId);

  if (!visualizations.length) {
    return <div>No visualizations available</div>;
  }

  if (!visualization) {
    return <div>Selected visualization not found</div>;
  }

  return (
    <div className='visualization-selector'>
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
      <div>
        {visualizations.map((v) => (
          <button key={v.id} onClick={() => onSelect(v.id)}>
            {v.title}
          </button>
        ))}
      </div>
    </div >
  );
};
