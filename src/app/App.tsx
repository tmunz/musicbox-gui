import './App.css';
import React, { startTransition, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FixedSizeQueue } from './utils/FixedSizeQueue';
import { SampleProvider } from './audio/SampleProvider';
import { useDimension } from './utils/useDimension';
import visualizations from './visualizations';
import { VisualizationSelector } from './visualizations/VisualizationSelector';
import { Menubar } from './ui/Menubar';
import { SettingsComponent } from './settings/SettingsComponent';
import { useAppState, VisualizationAction } from './AppContext';

export function App() {
  const elementRef = useRef<HTMLDivElement>(null);
  const { width, height } = useDimension(elementRef) ?? { width: 0, height: 0 };
  const { appState, dispatch } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();

  const [sampleProvider, setSampleProvider] = useState<FixedSizeQueue<Uint8Array>>(new FixedSizeQueue<Uint8Array>(1, new Uint8Array()));


  useEffect(() => {
    const pathId = location.pathname.replace('/', '');
    const visualization = visualizations.find((v) => v.id === pathId);
    if (visualization) {
      dispatch({ type: VisualizationAction.SET_VISUALIZATION, visualization });
    } else {
      navigate(`/`, { replace: false });
      dispatch({ type: VisualizationAction.SET_VISUALIZATION, visualization: visualizations[0] });
    }
  }, [location.pathname, navigate]);

  const selectVisualization = (id: string) => {
    const visualization = visualizations.find((v) => v.id === id);
    if (!visualization) {
      console.error(`Visualization with id ${id} not found`);
      return;
    }
    startTransition(() => {
      navigate(`/${id}`);
      dispatch({ type: VisualizationAction.SET_VISUALIZATION, visualization });
    });
  };

  return (
    <div className='musicbox' ref={elementRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {appState.visualization &&
        <appState.visualization.component
          sampleProvider={sampleProvider}
          canvas={{ width, height }}
          {...Object.fromEntries(Object.entries(appState.visualization.settings?.visualization || {}).map(([key, setting]) => [key, setting.value]))}
        />
      }
      <Menubar hideTimeout={3000}>
        <VisualizationSelector visualizations={visualizations} onSelect={selectVisualization} selectedId={appState.visualization?.id} />
        <SampleProvider
          onSampleProviderChange={setSampleProvider}
          {...Object.fromEntries(Object.entries(appState.visualization?.settings?.samples || {}).map(([key, setting]) => [key, setting.value]))}
        />
        <SettingsComponent />
      </Menubar>
    </div>
  );
}

