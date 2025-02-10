import React, { useEffect } from 'react';
import { useAudioAnalysis } from './useAudioAnalysis';
import { Audio } from './Audio';
import { SampleProvider } from './SampleProvider';

interface SampleProviderProps {
  onSampleProviderChange: (sampleProvider: SampleProvider) => void;
  frequencyBands?: number;
  sampleSize?: number;
  minFrequency?: number;
  maxFrequency?: number;
}

export const SampleProviderComponent = ({ onSampleProviderChange, frequencyBands = 32, sampleSize = 1, minFrequency = 10, maxFrequency = 10000 }: SampleProviderProps) => {

  const [streamProvider, setStreamProvider] = React.useState<Promise<MediaStream | null>>(new Promise(() => { }));
  const sampleProvider = useAudioAnalysis(streamProvider, frequencyBands, sampleSize, minFrequency, maxFrequency);

  useEffect(() => {
    onSampleProviderChange(sampleProvider);
  }, [sampleProvider]);

  return (
    <Audio onChange={(sp) => {
      setStreamProvider(sp);
      onSampleProviderChange(sampleProvider);
    }} />
  );
}