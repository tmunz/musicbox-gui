import React, { useState } from 'react';
import { PiSlidersHorizontalDuotone } from 'react-icons/pi';
import { useAppState, VisualizationAction } from '../AppContext';


export const VisualizationSettingsComponent = () => {

  const [showSettings, setShowSettings] = useState(false);
  const { appState, dispatch } = useAppState();

  return <div className='app-settings'>{
    showSettings ? (
      <div>
        <button onClick={() => setShowSettings(false)}>
          Close
        </button>
        {Object.entries(appState.visualization?.settings ?? {}).map(([sectionKey, section]: any) => (
          <section key={sectionKey}>
            <h2>{sectionKey}</h2>
            {Object.entries(section).map(([key, setting]: any) => (
              <div key={key}>
                <label>{setting.name}</label>
                <input
                  type='number'
                  value={setting.value}
                  onChange={(e) => dispatch({ type: VisualizationAction.UPDATE_VISUALIZATION_SETTINGS_VALUE, section: sectionKey, key, value: +e.target.value })}
                  min={setting.params?.min}
                  max={setting.params?.max}
                  step={setting.params?.step}
                />
              </div>
            ))}
          </section>
        ))}
      </div>
    ) : (
      <button onClick={() => setShowSettings(true)}>
        <PiSlidersHorizontalDuotone size={24} />
      </button>
    )
  }
  </div>;

}
