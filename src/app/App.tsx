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
import { VisualizationSettingsComponent } from './settings/VisualizationSettingsComponent';
import { SettingsAction, useSettings } from './settings/VisualizationSettingsContext';

export function App() {
  const elementRef = useRef<HTMLDivElement>(null);
  const { width, height } = useDimension(elementRef) ?? { width: 0, height: 0 };
  const { settings, dispatch } = useSettings();
  const [selectedVisualization, setSelectedVisualization] = React.useState<Visualization>(visualizations[0]);
  const [sampleProvider, setSampleProvider] = React.useState<FixedSizeQueue<Uint8Array>>(new FixedSizeQueue<Uint8Array>(1, new Uint8Array()));

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

  useEffect(() => {
    dispatch({ type: SettingsAction.SET_SETTINGS, newSettings: selectedVisualization.settings });
  }, [selectedVisualization]);

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
      <selectedVisualization.component
        sampleProvider={sampleProvider}
        canvas={{ width, height }}
        {...Object.fromEntries(Object.entries(settings?.visualization || {}).map(([key, setting]) => [key, setting.value]))}
      />
      <Menubar hideTimeout={3000}>
        <VisualizationSelector visualizations={visualizations} onSelect={selectVisualization} selectedId={selectedVisualization?.id} />
        <SampleProvider
          onSampleProviderChange={setSampleProvider}
          {...Object.fromEntries(Object.entries(settings?.samples || {}).map(([key, setting]) => [key, setting.value]))}
        />
        <VisualizationSettingsComponent />
      </Menubar>
    </div>
  );
}

