import React from 'react';
import { PiRecordDuotone, PiRecordFill, PiPlay, PiPlayFill, PiStop } from 'react-icons/pi';
import { MediaStreamType } from './MediaStreamType';

interface AudioControlsInterface {
  onRecord: () => void;
  onPlay: () => void;
  onStop: () => void;
  mediaStreamType: MediaStreamType | null;
}

export const AudioControls = ({ onRecord, onPlay, onStop, mediaStreamType }: AudioControlsInterface) => {


  return (
    <div className='flex justify-center items-center space-x-4 p-4 bg-gray-100 rounded-lg shadow-lg'>
      <button onClick={() => onRecord()} title='Record' disabled={mediaStreamType === MediaStreamType.MICROPHONE}>
        {mediaStreamType === MediaStreamType.MICROPHONE ? <PiRecordFill size={24} style={{ color: 'red' }} /> : <PiRecordDuotone size={24} />}
      </button>

      <button onClick={() => onPlay(/* TODO: Add URL */)} title='Play' disabled={mediaStreamType === MediaStreamType.URI}>
        <PiPlay size={24} />
      </button>

      <button onClick={() => onStop()} title='Stop' disabled={!mediaStreamType}>
        <PiStop size={24} />
      </button>
    </div>
  );
};
