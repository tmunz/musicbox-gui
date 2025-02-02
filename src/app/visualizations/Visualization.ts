import { ReactNode } from "react";
import { FixedSizeQueue } from "../utils/FixedSizeQueue";
import { VisualizationSettings } from "../settings/VisualizationSettingsContext";

export interface Visualization {
  id: string;
  title: string;
  artist: string;
  design: string;
  imgSrc: string;
  description: ReactNode;
  component: (props: { sampleProvider: FixedSizeQueue<Uint8Array>, canvas: { width: number, height: number } }) => React.JSX.Element;
  settings: VisualizationSettings;
}