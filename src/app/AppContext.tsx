import { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';
import { Visualization } from './visualizations/Visualization';

export interface AppState {
  visualization: Visualization | null;
}

export enum VisualizationAction {
  SET_VISUALIZATION = 'SET_VISUALIZATION',
  UPDATE_VISUALIZATION_SETTINGS_VALUE = 'UPDATE_VISUALIZATION_SETTINGS_VALUE',
}

type Action =
  | { type: VisualizationAction.SET_VISUALIZATION; visualization: Visualization | null }
  | {
      type: VisualizationAction.UPDATE_VISUALIZATION_SETTINGS_VALUE;
      section: string;
      key: string;
      value: any;
    };

const appStateReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case VisualizationAction.SET_VISUALIZATION:
      return {
        ...state,
        visualization: action.visualization,
      };
    case VisualizationAction.UPDATE_VISUALIZATION_SETTINGS_VALUE:
      if (!state.visualization) {
        return state;
      }
      return {
        ...state,
        visualization: {
          ...state.visualization,
          settings: {
            ...state.visualization.settings,
            [action.section]: {
              ...state.visualization.settings[action.section],
              [action.key]: {
                ...state.visualization.settings[action.section][action.key],
                value: action.value,
              },
            },
          },
        },
      };
    default:
      return state;
  }
};

const AppStateContext = createContext<{ appState: AppState; dispatch: Dispatch<Action> } | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [appState, dispatch] = useReducer(appStateReducer, { visualization: null });

  return <AppStateContext.Provider value={{ appState, dispatch }}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within a AppStateProvider');
  }
  return context;
};
