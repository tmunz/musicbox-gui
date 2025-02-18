import { useEffect, useState } from 'react';
import { SampleProvider } from './SampleProvider';
import { DataTexture, RedFormat, UnsignedByteType } from 'three';

export const useSampleProviderTexture = (sampleProvider?: SampleProvider): [DataTexture, () => void] => {
  const [sampleTexture, setSampleTexture] = useState<DataTexture>(new DataTexture(new Uint8Array(1), 1, 1, RedFormat, UnsignedByteType));

  useEffect(() => {
    if (sampleProvider && (sampleProvider.frequencyBands !== sampleTexture.image.width
      || sampleProvider.sampleSize !== sampleTexture.image.height)) {
      setSampleTexture(new DataTexture(sampleProvider.flat(), sampleProvider.frequencyBands, sampleProvider.sampleSize, RedFormat, UnsignedByteType));
    }
  }, [sampleProvider?.frequencyBands, sampleProvider?.sampleSize]);

  const applyToSampleTexture = () => {
    if (!sampleProvider) return;
    Object.assign(sampleTexture.image, {
      data: sampleProvider.flat(),
      width: sampleProvider.frequencyBands,
      height: sampleProvider.sampleSize,
    });
    sampleTexture.needsUpdate = true;
  }

  return [sampleTexture, applyToSampleTexture];
}