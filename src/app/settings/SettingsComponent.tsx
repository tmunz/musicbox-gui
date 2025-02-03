import './SettingsComponent.css';
import React from 'react';
import { useAppState, VisualizationAction } from '../AppContext';
import { NumberSettingsComponent } from './NumberSettingsComponent';


export const SettingsComponent = () => {

  const { appState, dispatch } = useAppState();

  return <div className='settings'>
    {Object.entries(appState.visualization?.settings ?? {}).map(([sectionKey, section]: any) => (
      <section key={sectionKey}>
        <h2>{sectionKey}</h2>
        {Object.entries(section).map(([key, setting]: any) => (
          <NumberSettingsComponent key={key} setting={setting} onChange={(value: number) => dispatch({ type: VisualizationAction.UPDATE_VISUALIZATION_SETTINGS_VALUE, section: sectionKey, key, value })} />
        ))}
      </section>
    ))}
  </div>;

}
