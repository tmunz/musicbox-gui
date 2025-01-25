import './App.css';
import React, { startTransition, useRef, ChangeEvent } from 'react';
import { Sidebar } from './ui/sidebar/Sidebar';
import { FixedSizeQueue } from './utils/FixedSizeQueue';
import { SampleProvider } from './audio/SampleProvider';
import { useDimension } from './utils/useDimension';
import { Visualization } from './visualizations/Visualization';
import visualizations from './visualizations';
import { VisualizationInformation } from './visualizations/VisualizationInformation';
import { Dropdown } from './ui/Dropdown';

export function App() {

  const elementRef = useRef<HTMLDivElement>(null);
  const { width, height } = useDimension(elementRef) ?? { width: 0, height: 0 };
  const [sampleProvider, setSampleProvider] = React.useState<FixedSizeQueue<Uint8Array>>(new FixedSizeQueue<Uint8Array>(16, new Uint8Array(42)));
  const [selectedVisualization, setSelectedVisualization] = React.useState<Visualization>(visualizations[0]);

  const selectVisualization = (i: number) => {
    const visvisualization = visualizations[i];
    startTransition(() => {
      setSelectedVisualization(visvisualization);
    });
  };

  return (
    <div className='musicbox' ref={elementRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <selectedVisualization.component sampleProvider={sampleProvider} canvas={{ width, height }} />
      <Sidebar items={[
        {
          id: 'info',
          content: <div>
            <Dropdown<Visualization>
              items={visualizations}
              getLabel={v => v.title}
              onSelect={selectVisualization}
            />
            <VisualizationInformation visualization={selectedVisualization} />
          </div>,
          button: <span>ℹ️</span>
        },
        {
          id: 'source',
          content: <SampleProvider onSampleProviderChange={setSampleProvider} />,
          button: <span>🎸</span>
        },
      ]}>
      </Sidebar>
    </div>
  );
}
