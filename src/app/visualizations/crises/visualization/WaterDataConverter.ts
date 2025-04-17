import { SampleProvider } from "../../../audio/SampleProvider";

type WaterData = { value: number, sampleIndex: number };

export function convertWaterData (sampleProvider?: SampleProvider) {
  if (!sampleProvider) return new Uint8Array();
  const result = new Uint8Array(sampleProvider.sampleSize * sampleProvider.frequencyBands);
  for (let i = 0; i < sampleProvider.frequencyBands; i++) {
    const frequency: WaterData[] = sampleProvider.samples.map((sample, sampleIndex) => ({ value: sample[i], sampleIndex }));
    const sortedFrequency: WaterData[] = [...frequency].sort((a, b) => b.value - a.value);
    for (let j = 0; j < sampleProvider.sampleSize; j++) {
      const sampleRelevance = calculateRelevance(sortedFrequency[j].sampleIndex, sampleProvider.sampleSize, sampleProvider.sampleSize);
      result[j * sampleProvider.frequencyBands + i] = sortedFrequency[j].value * sampleRelevance;
    }
  }
  return result;
}

function calculateRelevance(n: number, length: number, threshold: number) {
  if (n < 0 || length < n) return 0;
  const relativeX = n / length;
  const fallStart = threshold / length;
  if (relativeX <= fallStart) {
    return Math.sin((relativeX / fallStart) * (Math.PI / 2));
  }
  return Math.cos(((relativeX - fallStart) / (1 - fallStart)) * (Math.PI / 2));
}
