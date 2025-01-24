import React from 'react';
import { useAudioAnalysis } from '../audio/useAudioAnalysis';
import { UnknownPleasures } from './unknown-pleasures/UnknownPleasures';
import { useAudioStream } from '../audio/useAudioStream';
import { useDimension } from '../utils/useDimension';
import DarkSideOfTheMoon from './dark-side-of-the-moon/DarkSideOfTheMoon';

export const Visualizer = ({ frequencyBands = 42, numberOfSamples = 16, minFrequency = 10, maxFrequency = 10000 }) => {

  const dimensionRef = React.useRef<HTMLDivElement>(null);
  const { width, height } = useDimension(dimensionRef) ?? { width: 0, height: 0 };
  let streamProvider: Promise<MediaStream> | null = null;
  try {
    // streamProvider = useAudioStream('https://rautemusik.stream25.radiohost.de/rm-80s_mp3-192');
    streamProvider = navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    console.error(e);
  }
  const sampleProvider = useAudioAnalysis(streamProvider, frequencyBands, numberOfSamples, minFrequency, maxFrequency);

  return (
    <div className='visualizer' ref={dimensionRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* TODO Element based on Router */}
      {
        true
          ? <UnknownPleasures sampleProvider={sampleProvider} canvas={{ width, height }} />
          : <DarkSideOfTheMoon />
      }
    </div>
  );
};
