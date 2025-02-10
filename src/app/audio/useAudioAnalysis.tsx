import { useEffect, useRef, useState } from 'react';
import { SampleProvider } from './SampleProvider';

export const useAudioAnalysis = (streamProvider: Promise<MediaStream | null>, frequencyBands = 32, sampleSize = 1,
  minFrequency = 0, maxFrequency = 22050, melodicScale = false, sampleRate = 44100, fftSize = 2048) => {

  const audioDataRef = useRef<Uint8Array | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioFrames, setAudioFrames] = useState(new SampleProvider(sampleSize, new Uint8Array(frequencyBands).fill(0)));

  useEffect(() => {
    let audioContext: AudioContext | null = null;

    const initializeAudio = async () => {
      const streamSource = await streamProvider;
      if (streamSource) {
        audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        const source = audioContext.createMediaStreamSource(streamSource);
        source.connect(analyser);
        analyserRef.current = analyser;
        audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      } else {
        analyserRef.current = null;
        audioDataRef.current = null;
      }
    };

    initializeAudio();

    return () => {
      audioContext?.close();
    };
  }, [streamProvider, fftSize]);

  const getFrequencyData = () => {
    if (analyserRef.current && audioDataRef.current) {
      analyserRef.current.getByteFrequencyData(audioDataRef.current);
      const frequencyData = audioDataRef.current;
      const nyquist = sampleRate / 2;
      const minIndex = Math.floor((minFrequency / nyquist) * frequencyData.length);
      const maxIndex = Math.floor((maxFrequency / nyquist) * frequencyData.length);

      const slicedData = frequencyData.slice(minIndex, maxIndex + 1);
      const bandSize = slicedData.length / frequencyBands;
      const bands = new Uint8Array(frequencyBands);

      for (let i = 0; i < frequencyBands; i++) {
        let sum = 0;
        for (let j = Math.round(i * bandSize); j < (i + 1) * bandSize && j < slicedData.length; j++) {
          sum += slicedData[j];
        }
        bands[i] = (sum / bandSize);
      }
      return Uint8Array.from(bands);
    }
    return null;
  };

  useEffect(() => {
    setAudioFrames(new SampleProvider(sampleSize, new Uint8Array(frequencyBands).fill(0)));
  }, [sampleSize, frequencyBands, minFrequency, maxFrequency]);

  useEffect(() => {
    const interval = sampleRate / fftSize;
    const intervalId = setInterval(() => {
      const audioData = getFrequencyData();
      if (audioData) {
        audioFrames.push(audioData);
      } else {
        audioFrames.push(new Uint8Array(frequencyBands).fill(0));
      }
    }, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [audioFrames, sampleRate, fftSize, frequencyBands, minFrequency, maxFrequency]);

  return audioFrames;
};
