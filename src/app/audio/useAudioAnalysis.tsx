import { useEffect, useRef } from 'react';
import { FixedSizeQueue } from '../utils/FixedSizeQueue';

export const useAudioAnalysis = (streamProvider: Promise<MediaStream> | null, frequencyBands: number = 32, samples = 1,
  minFrequency = 0, maxFrequency = 22050, melodicScale: boolean = false, sampleRate: number = 44100, fftSize: number = 2048) => {

  const audioDataRef = useRef<Uint8Array | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioFramesRef = useRef(new FixedSizeQueue<Uint8Array>(samples, new Uint8Array(frequencyBands).fill(0)));

  useEffect(() => {
    let audioContext: AudioContext | null = null;

    const initializeAudio = async () => {
      if (!streamProvider) return;
      const stream = await streamProvider;
      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    };

    initializeAudio();

    return () => {
      audioContext?.close();
    };
  }, [streamProvider, fftSize, frequencyBands]);

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
    const interval = sampleRate / fftSize;
    const intervalId = setInterval(() => {
      const audioData = getFrequencyData();
      if (audioData) {
        audioFramesRef.current.push(audioData);
      }
    }, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [getFrequencyData, sampleRate, fftSize, frequencyBands]);

  return audioFramesRef.current;
};
