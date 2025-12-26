import './SettingsComponent.css';
import { useAppState, VisualizationAction } from '../AppContext';
import { NumberSettingsComponent } from './NumberSettingsComponent';
import { Settings, Setting } from './Setting';

export const SettingsComponent = () => {
  const { appState, dispatch } = useAppState();

  return (
    <div className="settings">
      {Object.entries(appState.visualization?.settings ?? {}).map(([sectionKey, section]) => (
        <section key={sectionKey}>
          <h2>{sectionKey}</h2>
          {Object.entries(section as Settings).map(([key, setting]) => (
            <NumberSettingsComponent
              key={key}
              setting={setting as Setting<number>}
              onChange={(value: number) =>
                dispatch({
                  type: VisualizationAction.UPDATE_VISUALIZATION_SETTINGS_VALUE,
                  section: sectionKey,
                  key,
                  value,
                })
              }
            />
          ))}
        </section>
      ))}
    </div>
  );
};
