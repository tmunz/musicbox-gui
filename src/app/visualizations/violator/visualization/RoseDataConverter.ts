import { SampleProvider } from "../../../audio/SampleProvider";

export function convertWeightedMaxData(sampleProvider?: SampleProvider) {
  if (!sampleProvider) return new Uint8Array();
  const result = new Uint8Array(sampleProvider.frequencyBands);
  result.set(convert(sampleProvider.getMax(), sampleProvider.sampleSize));
  return result;
}

function convert(data: { max: number; sampleIndex: number }[], sampleSize: number): number[] {
  return data.map((d) => d.max * (sampleSize - d.sampleIndex) / sampleSize);
}