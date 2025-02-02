import './SettingsComponent.css';
import React, { useState } from 'react';
import { PiSlidersHorizontalDuotone, PiX } from 'react-icons/pi';
import { useAppState, VisualizationAction } from '../AppContext';
import { IconButton } from '../ui/IconButton';
import { NumberSettingsComponent } from './NumberSettingsComponent';


export const SettingsComponent = () => {

  const [showSettings, setShowSettings] = useState(false);
  const { appState, dispatch } = useAppState();

  return <div className='settings'>{
    showSettings ? (
      <>
        <div className='settings-content'>
          {Object.entries(appState.visualization?.settings ?? {}).map(([sectionKey, section]: any) => (
            <section key={sectionKey}>
              <h2>{sectionKey}</h2>
              {Object.entries(section).map(([key, setting]: any) => (
                <NumberSettingsComponent key={key} setting={setting} onChange={(value: number) => dispatch({ type: VisualizationAction.UPDATE_VISUALIZATION_SETTINGS_VALUE, section: sectionKey, key, value })} />
              ))}
            </section>
          ))}
        </div>
        <IconButton className='close-button' onClick={() => setShowSettings(false)}>
          <PiX size={36} />
        </IconButton>
      </>
    ) : (
      <IconButton onClick={() => setShowSettings(true)}>
        <PiSlidersHorizontalDuotone size={36} />
      </IconButton>
    )
  }
  </div>;

}
