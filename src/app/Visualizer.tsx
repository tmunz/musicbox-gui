import React, { useEffect, useRef } from 'react';
import { useAudio } from './audio/useAudio';

export const Visualizer = ({ frequencyBands = 42, numberOfSamples = 16, border = 50, baseLine = false }) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);
  const samples = useAudio(navigator.mediaDevices.getUserMedia({ audio: true }), frequencyBands, numberOfSamples);

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasContext = canvas?.getContext('2d');
    if (!canvas || !canvasContext) return;

    function normalizedGaussian(x: number, sigma = 0.1) {
      const mu = 0.5;
      const denominator = sigma * Math.sqrt(2 * Math.PI);
      const exponent = Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));

      return (1 / denominator) * exponent;
    }

    const getAmplitudeMultiplicator = (x: number) => {
      return 50 * normalizedGaussian(x, 0.1);
    }

    const draw = () => {
      canvasContext.fillStyle = 'black';
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height - 2 * border;

      const verticalDistance = h / (frequencyBands + 1);
      const displaySamples = numberOfSamples;
      const sliceWidth = w / (displaySamples - 1);

      for (let i = 0; i < frequencyBands; i++) {
        const frequencyBaseY = h + 1.5 * border - verticalDistance * i;

        if (baseLine) {
          canvasContext.beginPath();
          canvasContext.lineWidth = 1;
          canvasContext.strokeStyle = 'red';
          canvasContext.moveTo(border, frequencyBaseY);
          canvasContext.lineTo(border + w, frequencyBaseY);
          canvasContext.stroke();
        }

        canvasContext.beginPath();
        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = 'white';

        const line = [];

        for (let t = 0; t < displaySamples; t++) {
          const audioData = samples.get(t);
          const v = audioData ? audioData[i] / 256 : 0;
          const x = sliceWidth * t;
          line.push([x, v]);
        }

        const mirrorLine = [...line.map(([x, v]) => [x / 2, v]), ...line.slice(0, -1).reverse().map(([x, v]) => [w - x / 2, v])]
          .map(([x, v], i) => [x, frequencyBaseY - (v * getAmplitudeMultiplicator(i / (displaySamples * 2)))]);

        mirrorLine.forEach(([x, y], i) => {
          if (i === 0) {
            canvasContext.moveTo(x, y);
          } else {
            canvasContext.lineTo(x, y);
          }
        });
        canvasContext.stroke();
      }
      animationIdRef.current = requestAnimationFrame(draw);
    };

    animationIdRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [samples, numberOfSamples, frequencyBands, baseLine]);

  return (
    <canvas
      ref={canvasRef}
      width="600"
      height="800"
      style={{
        display: 'block',
        margin: '0 auto',
        backgroundColor: 'black',
      }}
    ></canvas>
  );
};
