import './Audio.css';
import React, { useEffect, useRef, useState } from 'react';
import { createAudioStream } from './AudioStream';
import { MediaStreamType } from './MediaStreamType';
import { IconButton } from '../ui/IconButton';
import { PiPlay, PiPlayFill, PiRecordDuotone, PiRecordFill, PiStop, PiUpload } from 'react-icons/pi';
import { SpotifyService } from '../spotify/SpotifyService';

interface AudioProviderProps {
  onChange: (stream: Promise<MediaStream | null>) => void;
}

export const Audio = ({ onChange }: AudioProviderProps) => {
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [currentStream, setCurrentStream] = useState<{
    stream: MediaStream;
    type: MediaStreamType;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('https://rautemusik.stream25.radiohost.de/rm-80s_mp3-192');
  const [fileName, setFileName] = useState<string>('');
  const [spotifyService] = useState(() => new SpotifyService());
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [currentSpotifyTrack, setCurrentSpotifyTrack] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO, use state management for errors
  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  useEffect(() => {
    const checkSpotifyAuth = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        setIsSpotifyLoading(true);
        try {
          const authenticated = await spotifyService.authenticate();
          if (authenticated) {
            await playSpotifyTrack();
          }
        } catch (e) {
          setError('Failed to play Spotify track after login: ' + (e as Error).message);
        } finally {
          setIsSpotifyLoading(false);
        }
      }
    };
    checkSpotifyAuth();
  }, []);

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
      const { stream, audio } = await createAudioStream(url);
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
      const { stream, audio } = await createAudioStream(fileUrl, true);
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

  const handleSpotifyLogin = async () => {
    setIsSpotifyLoading(true);
    try {
      const authenticated = await spotifyService.authenticate();
      if (authenticated) {
        await playSpotifyTrack();
      } else {
        setError('Failed to authenticate with Spotify');
      }
    } catch (e) {
      setError('Spotify login failed: ' + (e as Error).message);
    } finally {
      setIsSpotifyLoading(false);
    }
  };

  const playSpotifyTrack = async () => {
    try {
      const track = await spotifyService.playAlbumAndGetCurrentTrack();
      if (track) {
        setCurrentSpotifyTrack(`${track.name} by ${track.artists.map((a: any) => a.name).join(', ')}`);
        setError(null);
        console.log('Playing through Spotify:', track.name);
      } else {
        setError('Could not start playback');
      }
    } catch (e) {
      setError('Failed to play Spotify track: ' + (e as Error).message);
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
    
    // Stop Spotify playback if it's currently playing
    if (currentSpotifyTrack) {
      spotifyService.stopPlayback().catch(console.error);
    }
    
    // Close audio context if it exists
    if (audioContext) {
      audioContext.close().catch(console.error);
      setAudioContext(null);
    }
    
    if (currentStream?.stream) {
      currentStream.stream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
      onChange(Promise.resolve(null));
      setError(null);
    }
    setFileName('');
    setCurrentSpotifyTrack('');
  };

  const size = 36;

  return (
    <div className="audio">
      <IconButton onClick={stop} title="Stop" disabled={!currentStream && !currentSpotifyTrack}>
        <PiStop size={size} />
      </IconButton>

      <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileChange} />
      <IconButton
        onClick={handleUploadClick}
        title={fileName || 'Upload Audio File'}
        disabled={currentStream?.type === MediaStreamType.FILE}
      >
        <PiUpload size={size} style={currentStream?.type === MediaStreamType.FILE ? { color: 'red' } : {}} />
      </IconButton>

      <IconButton
        onClick={activateMicrophone}
        title="Record"
        disabled={currentStream?.type === MediaStreamType.MICROPHONE}
      >
        {currentStream?.type === MediaStreamType.MICROPHONE ? (
          <PiRecordFill size={size} style={{ color: 'red' }} />
        ) : (
          <PiRecordDuotone size={size} />
        )}
      </IconButton>

      <button
        onClick={handleSpotifyLogin}
        disabled={isSpotifyLoading}
        style={{
          background: '#1DB954',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: isSpotifyLoading ? 'not-allowed' : 'pointer',
          opacity: isSpotifyLoading ? 0.6 : 1
        }}
        title={currentSpotifyTrack || "Play Random Spotify Track"}
      >
        {isSpotifyLoading ? 'Loading...' : 'Spotify'}
      </button>

      <div className="url-stream">
        <div className="input-wrapper">
          <input value={url} onChange={e => setUrl(e.target.value)} />
        </div>
        <IconButton onClick={activateUrlStream} title="Play" disabled={currentStream?.type === MediaStreamType.URI}>
          {currentStream?.type === MediaStreamType.URI ? (
            <PiPlayFill size={size} style={{ color: 'red' }} />
          ) : (
            <PiPlay size={size} />
          )}
        </IconButton>
      </div>
    </div>
  );
};
