import React from 'react';
import { Point2 } from '../../utils/Point';
import { drawBezierCurve, smooth } from '../../utils/SvgUtils';

export interface UnknownPleasuresCanvasProps {
  lines?: Point2[][];
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  smoothness?: number;
}

export const UnknownPleasuresCanvas = ({ lines = [], width = 400, height = 600, color = 'white', backgroundColor = 'black', smoothness = 0.2 }: UnknownPleasuresCanvasProps) => {

  const style = `stroke="${color}" fill="${backgroundColor}" stroke-width="1"`;

  const getBezierPaths = () => lines.map((line) =>
    drawBezierCurve(smooth(line, smoothness).map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) })), style));

  const getSimplePaths = () => lines.map((line) =>
    `<path d="${line.map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')}" ${style} />`);

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}" />
        ${(smoothness === 0 ? getSimplePaths() : getBezierPaths()).reverse().join('')}
    </svg`;

  return (
    <div dangerouslySetInnerHTML={{ __html: svgContent }} />
  );
};
