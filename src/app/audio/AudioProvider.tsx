import React from "react";
import { useAudioStream } from "./useAudioStream";

interface AudioProviderProps {
  onChange: (stream: Promise<MediaStream>) => void;
}

export const AudioProvider = ({ onChange }: AudioProviderProps) => {

  const getMicrophoneStream = () => {
    try {
      return navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  const getAudioStream = (url: string = 'https://rautemusik.stream25.radiohost.de/rm-80s_mp3-192') => {
    try {
      return useAudioStream(url);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  return (
    <div>
      <h2>Audio Provider</h2>
      <button onClick={() => onChange(getMicrophoneStream())}>Microphone</button>
      <button onClick={() => onChange(getAudioStream())}>Audio</button>
    </div>
  );
}