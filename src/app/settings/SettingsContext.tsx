import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import sampleSettings from '../audio/SampleSettings';
import { Settings } from './Setting';

export interface AppSettings {
  samples: Settings;
  visualization: Settings;
}

type Action =
  | { type: 'UPDATE_SETTING'; section: keyof AppSettings; key: string; value: any }
  | { type: 'REPLACE_SETTINGS'; newSettings: AppSettings };

const settingsReducer = (state: AppSettings, action: Action): AppSettings => {
  switch (action.type) {
    case 'UPDATE_SETTING':
      return {
        ...state,
        [action.section]: {
          ...state[action.section],
          [action.key]: {
            ...state[action.section][action.key],
            value: action.value,
          },
        },
      };
    case 'REPLACE_SETTINGS':
      return action.newSettings;
    default:
      return state;
  }
};

const SettingsContext = createContext<{ settings: AppSettings; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, dispatch] = useReducer(settingsReducer, { samples: sampleSettings, visualization: {} });

  return (
    <SettingsContext.Provider value={{ settings, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
