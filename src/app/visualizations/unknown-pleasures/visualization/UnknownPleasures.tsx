import React, { useEffect, useRef } from 'react';
import { FixedSizeQueue } from '../../../utils/FixedSizeQueue';
import { UnknownPleasuresCanvas, UnknownPleasuresCanvasProps } from './UnknownPleasuresCanvas';
import { Point2 } from '../../../utils/Point';

export interface UnknownPleasuresProps {
  sampleProvider: FixedSizeQueue<Uint8Array>;
  canvas?: UnknownPleasuresCanvasProps;
  noise?: number;
}

export const UnknownPleasures = ({ sampleProvider, canvas, noise = 0.2 }: UnknownPleasuresProps) => {

  const animationIdRef = useRef<number>(0);
  const [lines, setLines] = React.useState<Point2[][]>([]);

  const borderThreshold = 10;
  const w_ = canvas?.width ?? 400;
  const h_ = canvas?.height ?? 600;
  const width = Math.min(w_, h_ * 3 / 4) * 0.5;
  const height = Math.min(w_ * 4 / 3, h_) * 0.5;

  function gaussianDeviation(x: number, mu = 0.5, sigma = 0.08) {
    const denominator = sigma * Math.sqrt(2 * Math.PI);
    const exponent = Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    return (1 / denominator) * exponent;
  }

  useEffect(() => {
    const convertSamplesToPoints = () => {
      const border = height * 0.1;
      const h = height - border;
      const w = width - borderThreshold;
      const l = (width - w) / 2;
      const frequencyBands = sampleProvider.get(0)?.length;
      const numberOfSamples = sampleProvider.getFullSize();
      const verticalDistance = h / (frequencyBands + 1);
      const displaySamples = numberOfSamples;
      const dX = w / (displaySamples - 1);
      const line = [];
      const sizeMultiplier = h / frequencyBands;

      for (let i = 0; i < frequencyBands; i++) {

        const frequencyBaseY = h + border - verticalDistance * i - borderThreshold;
        const values: number[] = [];

        for (let t = displaySamples - 1; t >= 0; t--) {
          const audioData = sampleProvider.get(t);
          const v = audioData ? audioData[i] / 255 : 0;
          values.push(v);
        }

        line.push([...values, ...values.slice(0, -1).reverse()].map((v, j, arr) => {
          const frequencyBandsMultiplier = Math.pow((i + 1), 0.2); // lower frequency bands have generally higher values, so we dimm them a bit
          const value = Math.pow(v * frequencyBandsMultiplier, 1.5); // creates a threshold so small values are much less visible
          const fadeOutMultiplier = gaussianDeviation(j / arr.length); // fades out older entries 
          const fadeOutNoise = (1 - noise) + Math.random() * noise;
          const baseNoise = (Math.random() - 0.5) * noise / 4;
          return { x: l + j / 2 * dX, y: frequencyBaseY - value * sizeMultiplier * fadeOutMultiplier * fadeOutNoise + sizeMultiplier * baseNoise };
        }));
      }
      setLines(line);
      animationIdRef.current = requestAnimationFrame(convertSamplesToPoints);
    };

    animationIdRef.current = requestAnimationFrame(convertSamplesToPoints);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [sampleProvider, width, height, noise]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <UnknownPleasuresCanvas {...canvas} width={width} height={height} lines={lines} />
    </div>
  );
};
