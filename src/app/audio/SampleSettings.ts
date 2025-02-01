import { Settings, SettingType } from "../settings/Setting";

const sampleSettings: Settings = {
  frequencyBands: {
    id: 'frequencyBands',
    name: 'Frequency Bands',
    description: 'The number of frequency bands to analyze.',
    type: SettingType.NUMBER,
    params: {
      min: 1,
      max: 1024,
      step: 1
    },
    value: 42
  },
  sampleSize: {
    id: 'sampleSize',
    name: 'Sample Size',
    description: 'The number of samples to keep in the queue.',
    type: SettingType.NUMBER,
    params: {
      min: 1,
      max: 1024,
      step: 1
    },
    value: 16
  },
  minFrequency: {
    id: 'minFrequency',
    name: 'Min Frequency',
    description: 'The minimum frequency to analyze.',
    type: SettingType.NUMBER,
    params: {
      min: 0,
      max: 22000,
      step: 1
    },
    value: 10
  },
  maxFrequency: {
    id: 'maxFrequency',
    name: 'Max Frequency',
    description: 'The maximum frequency to analyze.',
    type: SettingType.NUMBER,
    params: {
      min: 0,
      max: 22050,
      step: 1
    },
    value: 10000
  }
};

export default sampleSettings;