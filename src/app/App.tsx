import './App.css';
import React, { startTransition, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SampleProviderComponent } from './audio/SampleProviderComponent';
import { useDimension } from './utils/useDimension';
import visualizations from './visualizations';
import { Menubar } from './ui/Menubar';
import { SettingsComponent } from './settings/SettingsComponent';
import { useAppState, VisualizationAction } from './AppContext';
import { Carousel } from './ui/Carousel';
import { VisualizationComponent } from './visualizations/VisualizationComponent';
import { MenubarItem } from './ui/MenubarItem';
import { PiInfo, PiSlidersHorizontalDuotone } from 'react-icons/pi';
import { VisualizationInfo } from './visualizations/VisualizationInfo';
import { SampleProvider } from './audio/SampleProvider';

export function App() {
  const elementRef = useRef<HTMLDivElement>(null);
  const { width, height } = useDimension(elementRef) ?? { width: 0, height: 0 };
  const { appState, dispatch } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();

  const [sampleProvider, setSampleProvider] = useState<SampleProvider>(new SampleProvider(1, new Uint8Array()));


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

  const items = visualizations.map((v) => {
    const active = appState.visualization?.id === v.id;
    return {
      id: v.id, component: <VisualizationComponent
        key={v.id}
        visualization={active ? appState.visualization! : v}
        sampleProvider={sampleProvider}
        canvas={{ width, height }}
        active={active}
      />
    };
  });

  return (
    <div className='musicbox' ref={elementRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Carousel
        items={items}
        selectedId={appState.visualization?.id}
        onSelect={selectVisualization}
        defaultFocus
      />
      <Menubar hideTimeout={3000}>
        <SampleProviderComponent
          onSampleProviderChange={setSampleProvider}
          {...Object.fromEntries(Object.entries(appState.visualization?.settings?.samples || {}).map(([key, setting]) => [key, setting.value]))}
        />
        <MenubarItem icon={PiSlidersHorizontalDuotone}>
          <SettingsComponent />
        </MenubarItem>
        <MenubarItem icon={PiInfo}>
          <VisualizationInfo visualization={appState.visualization} />
        </MenubarItem>
      </Menubar>
    </div>
  );
}

