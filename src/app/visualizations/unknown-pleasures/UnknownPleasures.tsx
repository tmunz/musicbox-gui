import React, { useEffect, useRef } from 'react';
import { FixedSizeQueue } from '../../utils/FixedSizeQueue';
import { UnknownPleasuresCanvas, UnknownPleasuresCanvasProps } from './UnknownPleasuresCanvas';
import { Point2 } from '../../utils/Point';

export interface UnknownPleasuresProps {
  sampleProvider: FixedSizeQueue<Uint8Array>;
  canvas?: UnknownPleasuresCanvasProps;
}

export const UnknownPleasures = ({ sampleProvider, canvas }: UnknownPleasuresProps) => {

  const animationIdRef = useRef<number>(0);
  const [lines, setLines] = React.useState<Point2[][]>([]);

  function gaussianDeviation(x: number, mu = 0.5, sigma = 0.08) {
    const denominator = sigma * Math.sqrt(2 * Math.PI);
    const exponent = Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    return (1 / denominator) * exponent;
  }

  useEffect(() => {
    const convertSamplesToPoints = () => {
      const width = canvas?.width ?? 400;
      const height = canvas?.height ?? 600;
      const border = 200;
      const d = Math.min(width, height);
      const h = d - 2 * border;
      const w = h * 3 / 4;
      const l = (width - w) / 2;
      const frequencyBands = sampleProvider.get(0)?.length;
      const numberOfSamples = sampleProvider.getFullSize();
      const verticalDistance = h / (frequencyBands + 1);
      const displaySamples = numberOfSamples;
      const dX = w / (displaySamples - 1);
      const line = [];
      const sizeMultiplier = h / frequencyBands;

      for (let i = 0; i < frequencyBands; i++) {

        const frequencyBaseY = h + border - verticalDistance * i;
        const values: number[] = [];

        for (let t = 0; t < displaySamples; t++) {
          const audioData = sampleProvider.get(t);
          const v = audioData ? audioData[i] / 255 : 0;
          values.push(v);
        }

        line.push([...values, ...values.slice(0, -1).reverse()].map((v, j, arr) => {
          const frequencyBandsMultiplier = Math.pow((i + 1), 0.2); // lower frequency bands have generally higher values, so we dimm them a bit
          const value = Math.pow(v * frequencyBandsMultiplier, 1.5); // creates a threshold so small values are much less visible
          const fadeOutMultiplier = gaussianDeviation(j / arr.length); // fades out older entries 
          const fadeOutNoise = 0.8 + Math.random() * 0.2;
          const baseNoise = Math.random() * 0.05 - 0.025;
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
  }, [sampleProvider, canvas?.width, canvas?.height]);

  return (
    <UnknownPleasuresCanvas {...canvas} lines={lines} />
  );
};
