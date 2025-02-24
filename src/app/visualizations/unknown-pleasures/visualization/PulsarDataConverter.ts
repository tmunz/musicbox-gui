import { SampleProvider } from "../../../audio/SampleProvider";

export type PulsarData = { value: number, sampleIndex: number };

export function convertPulsarData (sampleProvider?: SampleProvider) {
  if (!sampleProvider) return new Uint8Array();
  const result = new Uint8Array(sampleProvider.sampleSize * sampleProvider.frequencyBands);
  for (let i = 0; i < sampleProvider.frequencyBands; i++) {
    const frequency: PulsarData[] = sampleProvider.samples.map((sample, sampleIndex) => ({ value: sample[i], sampleIndex }));
    const sortedFrequency: PulsarData[] = [...frequency].sort((a, b) => b.value - a.value);
    const max = sortedFrequency[0].value;
    const min = sortedFrequency[sortedFrequency.length - 1].value;
    const relativeOffCenter = 0.25 + 0.5 * (max / 255);
    const resultFrequency = rearrange(sortedFrequency, relativeOffCenter);
    for (let j = 0; j < sampleProvider.sampleSize; j++) {
      const normalized = (resultFrequency[j].value - min) / Math.max((max - min), 1); // increase difference by moving baseline to min
      const sampleRelevance = animateAmplitude(resultFrequency[j].sampleIndex, sampleProvider.sampleSize, Math.min(6, sampleProvider.sampleSize)); // rise to peak position and fall afterwards
      const sampleWeight = getWeight(j / sampleProvider.sampleSize); // fall off towards the edges
      const frequencyWeight = max * Math.exp(normalized * 3) / Math.exp(3); // emphasize high values
      result[j * sampleProvider.frequencyBands + i] = normalized * sampleRelevance * sampleWeight * frequencyWeight;
    }
  }
  return result;
}

function rearrange (arr: PulsarData[], relativeOffset = 0.5): PulsarData[] {
  const centerSortedFrequency: PulsarData[] = [];
  arr.forEach((e, j) => {
    const pos = Math.floor(arr.length * relativeOffset) + (j % 2 === 0 ? Math.floor(j / 2) : -Math.floor(j / 2) - 1);
    centerSortedFrequency[(arr.length + pos) % arr.length] = e;
  });
  return centerSortedFrequency;
}

function animateAmplitude(n: number, length: number, threshold: number) {
  if (n < 0 || length < n) return 0;
  const relativeX = n / length;
  const fallStart = threshold / length;
  if (relativeX <= fallStart) {
    return Math.sin((relativeX / fallStart) * (Math.PI / 2));
  }
  return Math.cos(((relativeX - fallStart) / (1 - fallStart)) * (Math.PI / 2));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3.0 - 2.0 * t);
}

function getWeight(x: number) {
  const p = Math.min(x, 1 - x);
  return 0.1 * smoothstep(-0.3, 0.3, p) + smoothstep(0.25, 0.35, p);
}
