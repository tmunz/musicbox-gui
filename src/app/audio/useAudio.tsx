let sharedAudioContext: AudioContext | null = null;
const connectedElements = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();

const getAudioContext = (): AudioContext => {
  if (!sharedAudioContext) {
    sharedAudioContext = new window.AudioContext();
  }
  return sharedAudioContext;
};

export const useAudio = (url: string, loop: boolean = false): Promise<{ stream: MediaStream, audio: HTMLAudioElement }> => {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = getAudioContext();
      const audio = new Audio();
      audio.src = url;
      audio.crossOrigin = 'anonymous';
      audio.loop = loop;
      
      const onCanPlay = () => {
        try {
          let source = connectedElements.get(audio);
          if (!source) {
            source = audioContext.createMediaElementSource(audio);
            connectedElements.set(audio, source);
          }
          
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          source.connect(audioContext.destination);
          audio.removeEventListener('canplay', onCanPlay);
          resolve({ stream: destination.stream, audio });
        } catch (err) {
          reject(new Error(`Failed to create media source: ${(err as Error).message}`));
        }
      };
      
      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', (err) => {
        audio.removeEventListener('canplay', onCanPlay);
        reject(new Error(`Failed to load audio stream: ${err.message}`));
      });

    } catch (err) {
      reject(err);
    }
  });
};
