import React, { useState } from 'react';
import { PiSlidersHorizontalDuotone } from 'react-icons/pi';
import { useSettings } from './SettingsContext';
export const AppSettingsComponent = () => {

  const [showSettings, setShowSettings] = useState(false);
  const { settings, dispatch } = useSettings();

  return <div className='app-settings'>{
    showSettings ? (
      <div className='app-settings'>
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
                  onChange={(e) => dispatch({ type: 'UPDATE_SETTING', section: sectionKey, key, value: e.target.value })}
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
