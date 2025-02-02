import React, { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';
import { Settings } from './Setting';

export type VisualizationSettings = Record<string, Settings>;

export enum SettingsAction {
  UPDATE_SETTING = 'UPDATE_SETTING',
  SET_SETTINGS = 'SET_SETTINGS',
}

type Action =
  | { type: SettingsAction.UPDATE_SETTING; section: keyof VisualizationSettings; key: string; value: any }
  | { type: SettingsAction.SET_SETTINGS; newSettings: VisualizationSettings };

const settingsReducer = (state: VisualizationSettings, action: Action): VisualizationSettings => {
  switch (action.type) {
    case SettingsAction.UPDATE_SETTING:
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
    case SettingsAction.SET_SETTINGS:
      return action.newSettings;
    default:
      return state;
  }
};

const SettingsContext = createContext<{ settings: VisualizationSettings; dispatch: Dispatch<Action> } | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, dispatch] = useReducer(settingsReducer, {});

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
