import './App.css';
import React, { startTransition, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FixedSizeQueue } from './utils/FixedSizeQueue';
import { SampleProvider } from './audio/SampleProvider';
import { useDimension } from './utils/useDimension';
import { Visualization } from './visualizations/Visualization';
import visualizations from './visualizations';
import { VisualizationSelector } from './visualizations/VisualizationSelector';
import { Menubar } from './ui/Menubar';
import { AppSettingsComponent } from './settings/AppSettingsComponent';
import { useSettings } from './settings/SettingsContext';

export function App() {
  const elementRef = useRef<HTMLDivElement>(null);
  const { width, height } = useDimension(elementRef) ?? { width: 0, height: 0 };
  const { settings } = useSettings();
  const [selectedVisualization, setSelectedVisualization] = React.useState<Visualization>(visualizations[0]);
  const [sampleProvider, setSampleProvider] = React.useState<FixedSizeQueue<Uint8Array>>(
    new FixedSizeQueue<Uint8Array>(16, new Uint8Array(42))
  );

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathId = location.pathname.replace('/', '');
    const vis = visualizations.find((v) => v.id === pathId);
    if (vis) {
      setSelectedVisualization(vis);
    } else {
      navigate(`/`, { replace: false });
      setSelectedVisualization(visualizations[0]);
    }
  }, [location.pathname, navigate]);



  const selectVisualization = (id: string) => {
    const vis = visualizations.find((v) => v.id === id);
    if (!vis) {
      console.error(`Visualization with id ${id} not found`);
      return;
    }
    startTransition(() => {
      setSelectedVisualization(vis);
      navigate(`/${id}`);
    });
  };

  return (
    <div className='musicbox' ref={elementRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <selectedVisualization.component sampleProvider={sampleProvider} canvas={{ width, height }} />
      <Menubar hideTimeout={3000}>
        <VisualizationSelector visualizations={visualizations} onSelect={selectVisualization} selectedId={selectedVisualization?.id} />
        <SampleProvider
          onSampleProviderChange={setSampleProvider}
          frequencyBands={settings.samples.frequencyBands.value}
          sampleSize={settings.samples.sampleSize.value}
          minFrequency={settings.samples.minFrequency.value}
          maxFrequency={settings.samples.maxFrequency.value}
        />
        <AppSettingsComponent />
      </Menubar>
    </div>
  );
}

