import React from "react";
import { useAudioAnalysis } from "./useAudioAnalysis";
import { AudioProvider } from "./AudioProvider";
import { FixedSizeQueue } from "../utils/FixedSizeQueue";

interface AudioProviderProps {
  onSampleProviderChange: (sampleProvider: FixedSizeQueue<Uint8Array>) => void;
  frequencyBands?: number;
  numberOfSamples?: number;
  minFrequency?: number;
  maxFrequency?: number;
}

export const SampleProvider = ({ onSampleProviderChange, frequencyBands = 42, numberOfSamples = 16, minFrequency = 10, maxFrequency = 10000 }: AudioProviderProps) => {

  const handleStreamProviderChange = (streamProvider: Promise<MediaStream>) => {
    onSampleProviderChange(useAudioAnalysis(streamProvider, frequencyBands, numberOfSamples, minFrequency, maxFrequency));
  }

  // TODO add settings for frequency bands, number of samples, min and max frequency

  return (
    <div>
      <h1>Audio Settings</h1>
      <AudioProvider onChange={handleStreamProviderChange} />
    </div>
  );
}