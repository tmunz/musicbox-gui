import { Setting } from './Setting';

export interface NumberSetting extends Setting<number> {
  params?: {
    min?: number;
    max?: number;
    step?: number;
  };
}
