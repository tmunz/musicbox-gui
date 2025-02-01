import React from "react";
import { useAudioAnalysis } from "./useAudioAnalysis";
import { Audio } from "./Audio";
import { FixedSizeQueue } from "../utils/FixedSizeQueue";

interface SampleProviderProps {
  onSampleProviderChange: (sampleProvider: FixedSizeQueue<Uint8Array>) => void;
  frequencyBands?: number;
  sampleSize?: number;
  minFrequency?: number;
  maxFrequency?: number;
}

export const SampleProvider = ({ onSampleProviderChange, frequencyBands = 42, sampleSize = 16, minFrequency = 10, maxFrequency = 10000 }: SampleProviderProps) => {

  const [streamProvider, setStreamProvider] = React.useState<Promise<MediaStream | null>>(new Promise(() => { }));
  const sampleProvider = useAudioAnalysis(streamProvider, frequencyBands, sampleSize, minFrequency, maxFrequency);

  return (
    <Audio onChange={(sp) => {
      setStreamProvider(sp);
      onSampleProviderChange(sampleProvider);
    }} />
  );
}