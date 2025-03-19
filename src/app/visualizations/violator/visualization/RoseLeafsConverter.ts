import { SampleProvider } from "../../../audio/SampleProvider";

export function convertRoseLeafData(sampleProvider?: SampleProvider, numberOfLeafs: number = 4) {
  if (!sampleProvider) return new Uint8Array();
  const result = new Uint8Array(sampleProvider.frequencyBands);
  result.set(convert(sampleProvider.getMax(), numberOfLeafs, sampleProvider.sampleSize));
  return result;
}

function convert(data: { max: number; sampleIndex: number }[], sections: number, sampleSize: number): number[] {
  const sectionSize = Math.ceil(data.length / sections);
  const result: number[] =
    Array.from({ length: sections }, (_, i) => data
      .slice(i * sectionSize, (i + 1) * sectionSize)
      .reduce((agg, curr, i) => {
        const targetMaxIndex = Math.ceil(Math.min(8, sampleSize / 2));
        const relevanceCurr = curr.max * (curr.sampleIndex <= targetMaxIndex ? (curr.sampleIndex / targetMaxIndex) : (1 - (curr.sampleIndex - targetMaxIndex) / (sampleSize - targetMaxIndex)));
        // const relevanceCurr = curr.max * ((sampleSize - curr.sampleIndex) / sampleSize);
        return relevanceCurr > agg.max ? { max: relevanceCurr, frequencyIndex: i } : agg;
      }, { max: 0, frequencyIndex: 0 })
    ).flatMap((e: { max: number, frequencyIndex: number }) =>
      Array.from({ length: sectionSize }, (d, i) => i === e.frequencyIndex ? Math.round(e.max) : 0));
  return result;
}