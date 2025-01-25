export const useAudio = (url: string): Promise<{ stream: MediaStream, audio: HTMLAudioElement }> => {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = new window.AudioContext();
      const audio = new Audio();
      audio.src = url;
      audio.crossOrigin = 'anonymous';
      audio.addEventListener('canplay', () => {
        const source = audioContext.createMediaElementSource(audio);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioContext.destination);
        resolve({ stream: destination.stream, audio });
      });
      audio.addEventListener('error', (err) => {
        reject(new Error(`Failed to load audio stream: ${err.message}`));
      });

    } catch (err) {
      reject(err);
    }
  });
};
