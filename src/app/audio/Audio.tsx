import './Audio.css';
import React, { useState } from 'react';
import { useAudio } from './useAudio';
import { MediaStreamType } from './MediaStreamType';
import { IconButton } from '../ui/IconButton';
import { PiPlay, PiPlayFill, PiRecordDuotone, PiRecordFill, PiStop } from 'react-icons/pi';

interface AudioProviderProps {
  onChange: (stream: Promise<MediaStream | null>) => void;
}

export const Audio = ({ onChange }: AudioProviderProps) => {
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [currentStream, setCurrentStream] = useState<{ stream: MediaStream, type: MediaStreamType } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('https://rautemusik.stream25.radiohost.de/rm-80s_mp3-192');


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

  const activateUrlStream = async () => {
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

  const size = 36;

  return (
    <div className='audio'>
      <IconButton onClick={stop} title='Stop' disabled={!currentStream}>
        <PiStop size={size} />
      </IconButton>

      <IconButton onClick={activateMicrophone} title='Record' disabled={currentStream?.type === MediaStreamType.MICROPHONE}>
        {currentStream?.type === MediaStreamType.MICROPHONE ? <PiRecordFill size={size} style={{ color: 'red' }} /> : <PiRecordDuotone size={size} />}
      </IconButton>

      <div className='url-stream'>
        <div className='input-wrapper'>
          <input value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <IconButton onClick={activateUrlStream} title='Play' disabled={currentStream?.type === MediaStreamType.URI}>
          {currentStream?.type === MediaStreamType.URI ? <PiPlayFill size={size} style={{ color: 'red' }} /> : <PiPlay size={size} />}
        </IconButton>
      </div>
    </div>
  );
};
