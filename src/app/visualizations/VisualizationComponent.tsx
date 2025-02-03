import './VisualizationComponent.css';
import React, { useState, useEffect, useRef } from 'react';
import { Visualization } from './Visualization';
import { useFade } from '../utils/useFade';

interface VisualizationComponentProps {
  visualization: Visualization;
  sampleProvider: any;
  canvas: { width: number; height: number };
  active?: boolean;
}

export const VisualizationComponent = ({ visualization, sampleProvider, canvas, active = true }: VisualizationComponentProps) => {

  const { visible, fadeStyle } = useFade(active, 500, 200);

  return (
    <div className='visualization-component' style={{ backgroundColor: visualization.color }}>
      <div style={fadeStyle}>
        {visible && (
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
