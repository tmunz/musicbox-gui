import './VisualizationSelector.css';
import React from 'react';
import { Visualization } from './Visualization';
import { IconButton } from '../ui/IconButton';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { VisualizationInfo } from './VisualizationInfo';

interface VisualizationSelectorProps {
  visualizations: Visualization[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

export const VisualizationSelector = ({ visualizations, onSelect, selectedId }: VisualizationSelectorProps) => {

  const [showInfo, setShowInfo] = React.useState(false);
  const visualizationIndex = visualizations.findIndex((v) => v.id === selectedId);
  const visualization = visualizations[visualizationIndex];
  const size = 36;

  if (!visualizations.length) {
    return <div>No visualizations available</div>;
  }

  if (!visualization) {
    return <div>Selected visualization not found</div>;
  }

  return (
    <div className='visualization-selector'>
      <IconButton onClick={() => onSelect(visualizations[(visualizationIndex - 1 + visualizations.length) % visualizations.length].id)} title='Previous visualization'>
        <PiCaretLeft size={size} />
      </IconButton>
      <IconButton onClick={() => setShowInfo(b => !b)} title='Show info'>
        {showInfo ? <VisualizationInfo visualization={visualization} /> : <img src={visualization.imgSrc} style={{ height: size }} />}
      </IconButton>
      <IconButton onClick={() => onSelect(visualizations[(visualizationIndex + 1) % visualizations.length].id)} title='Next visualization'>
        <PiCaretRight size={size} />
      </IconButton>
    </div>
  );
};
