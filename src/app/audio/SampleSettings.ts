import { Settings, SettingType } from "../settings/Setting";

export const createSampleSettings = (frequencyBands = 32, sampleSize = 1, minFrequency = 10, maxFrequency = 10000): Settings => ({
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
    value: frequencyBands
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
    value: sampleSize
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
    value: minFrequency
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
    value: maxFrequency
  }
});

export default createSampleSettings();