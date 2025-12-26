import { SampleProvider } from '../../../audio/SampleProvider';

export function convertLightData(sampleProvider?: SampleProvider) {
  if (!sampleProvider) return new Uint8Array();
  const result = new Uint8Array(sampleProvider.sampleSize * sampleProvider.frequencyBands);
  for (let i = 0; i < sampleProvider.frequencyBands; i++) {
    const frequency: number[] = sampleProvider.samples.map(sample => sample[i]);
    const sortedFrequency: number[] = [...frequency].sort((a, b) => b - a);
    const max = sortedFrequency[0];
    const min = sortedFrequency[sortedFrequency.length - 1];
    const spread = 255 / (max - min);
    for (let j = 0; j < sampleProvider.sampleSize; j++) {
      const value = (frequency[j] - min) * spread;
      result[j * sampleProvider.frequencyBands + i] = value;
    }
  }
  return result;
}
