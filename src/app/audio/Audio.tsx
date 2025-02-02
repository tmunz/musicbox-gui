import React from 'react';
import { useAudio } from './useAudio';
import { AudioControls } from './AudioControls';
import { MediaStreamType } from './MediaStreamType';

interface AudioProviderProps {
  onChange: (stream: Promise<MediaStream | null>) => void;
}

export const Audio = ({ onChange }: AudioProviderProps) => {
  const [audioPlayer, setAudioPlayer] = React.useState<HTMLAudioElement | null>(null);
  const [currentStream, setCurrentStream] = React.useState<{ stream: MediaStream, type: MediaStreamType } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const activateMicrophone = async () => {
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setCurrentStream({ stream, type: MediaStreamType.MICROPHONE });
      onChange(Promise.resolve(stream));
      setError(null);
    } catch (e) {
      setError('Unable to access microphone: ' + (e as Error).message);
    }
  };

  const activateUrlStream = async (url: string = 'https://rautemusik.stream25.radiohost.de/rm-80s_mp3-192') => {
    stop();
    try {
      const { stream, audio } = await useAudio(url);
      setCurrentStream({ stream, type: MediaStreamType.URI });
      setAudioPlayer(audio);
      audio.play();
      onChange(Promise.resolve(stream));
      setError(null);
    } catch (e) {
      setError('Unable to fetch audio stream: ' + (e as Error).message);
    }
  };

  const stop = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.src = '';
      setAudioPlayer(null);
    }
    if (currentStream?.stream) {
      currentStream.stream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
      onChange(Promise.resolve(null));
      setError(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <AudioControls onRecord={activateMicrophone} onPlay={activateUrlStream} onStop={stop} mediaStreamType={currentStream?.type ?? null} />
    </div>
  );
};
