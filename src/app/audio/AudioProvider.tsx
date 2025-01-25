import React from "react";
import { useAudio } from "./useAudio";

interface AudioProviderProps {
  onChange: (stream: Promise<MediaStream | null>) => void;
}

export const AudioProvider = ({ onChange }: AudioProviderProps) => {
  const [audioPlayer, setAudioPlayer] = React.useState<HTMLAudioElement | null>(null);
  const [currentStream, setCurrentStream] = React.useState<MediaStream | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const changeToMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setCurrentStream(stream);
      onChange(Promise.resolve(stream));
      setError(null);
    } catch (e) {
      setError("Unable to access microphone: " + (e as Error).message);
    }
  };

  const changeToUrlStream = async (url: string = 'https://rautemusik.stream25.radiohost.de/rm-80s_mp3-192') => {
    try {
      const { stream, audio } = await useAudio(url);
      setCurrentStream(stream);
      setAudioPlayer(audio);
      audio.play();
      onChange(Promise.resolve(stream));
      setError(null);
    } catch (e) {
      setError("Unable to fetch audio stream: " + (e as Error).message);
    }
  };

  const stop = () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
      onChange(Promise.resolve(null));
      setError(null);
    }
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.src = "";
      setAudioPlayer(null);
    }
  };

  return (
    <div>
      <h2>Audio Provider</h2>
      <div>
        <button onClick={() => { stop(); changeToMicrophone(); }}>Microphone</button>
        <button onClick={() => { stop(); changeToUrlStream() }}>Audio</button>
        <button onClick={stop} disabled={!currentStream}>Stop</button>
      </div>
      {currentStream && <p>Audio stream is active.</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
