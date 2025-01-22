import React from 'react';
import { useAudio } from './audio/useAudio';
import { UnknownPleasures } from './visualizers/UnknownPleasures';

export const Visualizer = ({ frequencyBands = 42, numberOfSamples = 16 }) => {

  let streamProvider: Promise<MediaStream> | null = null;
  try {
    streamProvider = navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    console.error(e);
  }
  const samples = useAudio(streamProvider, frequencyBands, numberOfSamples);

  return (
    <UnknownPleasures samples={samples} />
  );
};
