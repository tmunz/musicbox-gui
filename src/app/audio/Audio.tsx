import './Audio.css';
import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from './useAudio';
import { MediaStreamType } from './MediaStreamType';
import { IconButton } from '../ui/IconButton';
import { PiPlay, PiPlayFill, PiRecordDuotone, PiRecordFill, PiStop, PiUpload } from 'react-icons/pi';

interface AudioProviderProps {
  onChange: (stream: Promise<MediaStream | null>) => void;
}

export const Audio = ({ onChange }: AudioProviderProps) => {
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [currentStream, setCurrentStream] = useState<{ stream: MediaStream, type: MediaStreamType } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('https://rautemusik.stream25.radiohost.de/rm-80s_mp3-192');
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO, use state management for errors
  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

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

  const activateFileStream = async (file: File) => {
    stop();
    try {
      const fileUrl = URL.createObjectURL(file);
      const { stream, audio } = await useAudio(fileUrl, true);
      setCurrentStream({ stream, type: MediaStreamType.FILE });
      setAudioPlayer(audio);
      setFileName(file.name);
      audio.play();
      onChange(Promise.resolve(stream));
      setError(null);
    } catch (e) {
      setError('Unable to play audio file: ' + (e as Error).message);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      activateFileStream(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const stop = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.src = '';
      if (currentStream?.type === MediaStreamType.FILE && audioPlayer.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioPlayer.src);
      }
      setAudioPlayer(null);
    }
    if (currentStream?.stream) {
      currentStream.stream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
      onChange(Promise.resolve(null));
      setError(null);
    }
    setFileName('');
  };

  const size = 36;

  return (
    <div className='audio'>
      <IconButton onClick={stop} title='Stop' disabled={!currentStream}>
        <PiStop size={size} />
      </IconButton>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <IconButton onClick={handleUploadClick} title={fileName || 'Upload Audio File'} disabled={currentStream?.type === MediaStreamType.FILE}>
        <PiUpload size={size} style={currentStream?.type === MediaStreamType.FILE ? { color: 'red' } : {}} />
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
