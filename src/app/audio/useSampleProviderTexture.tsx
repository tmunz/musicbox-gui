import { useEffect, useState } from 'react';
import { SampleProvider } from './SampleProvider';
import { DataTexture, RedFormat, UnsignedByteType } from 'three';

export const useSampleProviderTexture = (
  sampleProvider?: SampleProvider,
  getData: (sampleProvider?: SampleProvider) => Uint8Array = (sp) => sp?.flat() ?? new Uint8Array(),
  getWidth: (sampleProvider?: SampleProvider) => number = (sp) => sp?.frequencyBands ?? 0,
  getHeight: (sampleProvider?: SampleProvider) => number = (sp) => sp?.sampleSize ?? 0,
): [DataTexture, () => void] => {
  const [sampleTexture, setSampleTexture] = useState<DataTexture>(new DataTexture(new Uint8Array(1), 1, 1, RedFormat, UnsignedByteType));

  useEffect(() => {
    const width = getWidth(sampleProvider);
    const height = getHeight(sampleProvider);
    if (sampleProvider && width > 0 && height > 0 && (width !== sampleTexture.image.width || height !== sampleTexture.image.height)) {
      setSampleTexture(new DataTexture(getData(sampleProvider), width, height, RedFormat, UnsignedByteType));
    }
  }, [sampleProvider?.frequencyBands, sampleProvider?.sampleSize]);

  const applyToSampleTexture = () => {
    if (!sampleProvider) return;
    const width = getWidth(sampleProvider);
    const height = getHeight(sampleProvider);
    if (width > 0 && height > 0) {
      Object.assign(sampleTexture.image, { data: getData(sampleProvider), width, height });
      sampleTexture.needsUpdate = true;
    }
  }

  return [sampleTexture, applyToSampleTexture];
}