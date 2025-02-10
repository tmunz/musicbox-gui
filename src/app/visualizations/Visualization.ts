import { ReactNode } from 'react';
import { Settings } from '../settings/Setting';
import { SampleProvider } from '../audio/SampleProvider';

export interface Visualization {
  id: string;
  title: string;
  artist: string;
  design: string;
  imgSrc: string;
  description: ReactNode;
  component: (props: { sampleProvider: SampleProvider, canvas: { width: number, height: number } }) => React.JSX.Element;
  color: string;
  settings: Record<string, Settings>;
}