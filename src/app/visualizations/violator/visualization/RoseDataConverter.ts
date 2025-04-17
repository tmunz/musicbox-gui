import { SampleProvider } from "../../../audio/SampleProvider";

export function convertWeightedMaxData(sampleProvider?: SampleProvider): Uint8Array {
  if (!sampleProvider) return new Uint8Array();
  const result = new Uint8Array(sampleProvider.frequencyBands);
  result.set(sampleProvider.getMax().map((d) => d.max * (sampleProvider.sampleSize - d.sampleIndex) / sampleProvider.sampleSize));
  return result;
}

export function getBassValue(sampleProvider?: SampleProvider): number {
  const bassRange = Math.min(10, sampleProvider?.frequencyBands ?? 0);
  const v = new Array(bassRange).fill(0)
    .map((_, frequencyIndex) => sampleProvider?.samples[0][frequencyIndex] ?? 0)
    .reduce((acc, val) => acc + val, 0) / bassRange / 255;
    return v ** 3;
}

type LeafData = { value: number, sampleIndex: number };

export function convertLeafData (sampleProvider?: SampleProvider) {
  if (!sampleProvider) return new Uint8Array();
  const result = new Uint8Array(sampleProvider.sampleSize * sampleProvider.frequencyBands);
  for (let i = 0; i < sampleProvider.frequencyBands; i++) {
    const frequency: LeafData[] = sampleProvider.samples.map((sample, sampleIndex) => ({ value: sample[i], sampleIndex }));
    const sortedFrequency: LeafData[] = [...frequency].sort((a, b) => b.value - a.value);
    const maxValue = sortedFrequency[0].value;
    const minValue = sortedFrequency[sortedFrequency.length - 1].value;
    const range = maxValue - minValue;
    for (let j = 0; j < sampleProvider.sampleSize; j++) {
      result[j * sampleProvider.frequencyBands + i] = (sortedFrequency[j].value - minValue) * 255 / range;
    }
  }
  return result;
}
