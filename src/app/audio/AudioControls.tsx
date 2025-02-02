import React from 'react';
import { PiRecordDuotone, PiRecordFill, PiPlay, PiPlayFill, PiStop } from 'react-icons/pi';
import { MediaStreamType } from './MediaStreamType';
import { IconButton } from '../ui/IconButton';

interface AudioControlsInterface {
  onRecord: () => void;
  onPlay: () => void;
  onStop: () => void;
  mediaStreamType: MediaStreamType | null;
}

export const AudioControls = ({ onRecord, onPlay, onStop, mediaStreamType }: AudioControlsInterface) => {

  const size = 36;

  return (
    <>
      <IconButton onClick={() => onRecord()} title='Record' disabled={mediaStreamType === MediaStreamType.MICROPHONE}>
        {mediaStreamType === MediaStreamType.MICROPHONE ? <PiRecordFill size={size} style={{ color: 'red' }} /> : <PiRecordDuotone size={size} />}
      </IconButton>

      <IconButton onClick={() => onPlay(/* TODO: Add URL */)} title='Play' disabled={mediaStreamType === MediaStreamType.URI}>
        {mediaStreamType === MediaStreamType.URI ? <PiPlayFill size={size} style={{ color: 'red' }} /> : <PiPlay size={size} />}
      </IconButton>

      <IconButton onClick={() => onStop()} title='Stop' disabled={!mediaStreamType}>
        <PiStop size={size} />
      </IconButton>
    </>
  );
};
