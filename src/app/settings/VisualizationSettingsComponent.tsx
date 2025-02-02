import React, { useState } from 'react';
import { PiSlidersHorizontalDuotone } from 'react-icons/pi';
import { SettingsAction, useSettings } from './VisualizationSettingsContext';


export const VisualizationSettingsComponent = () => {

  const [showSettings, setShowSettings] = useState(false);
  const { settings, dispatch } = useSettings();

  return <div className='app-settings'>{
    showSettings ? (
      <div>
        <button onClick={() => setShowSettings(false)}>
          Close
        </button>
        {Object.entries(settings).map(([sectionKey, section]: any) => (
          <section key={sectionKey}>
            <h2>{sectionKey}</h2>
            {Object.entries(section).map(([key, setting]: any) => (
              <div key={key}>
                <label>{setting.name}</label>
                <input
                  type='number'
                  value={setting.value}
                  onChange={(e) => dispatch({ type: SettingsAction.UPDATE_SETTING, section: sectionKey, key, value: +e.target.value })}
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
