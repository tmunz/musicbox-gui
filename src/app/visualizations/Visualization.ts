import { ReactNode } from "react";
import { FixedSizeQueue } from "../utils/FixedSizeQueue";
import { Settings } from "../settings/Setting";

export interface Visualization {
  id: string;
  title: string;
  artist: string;
  design: string;
  imgSrc: string;
  description: ReactNode;
  component: (props: { sampleProvider: FixedSizeQueue<Uint8Array>, canvas: { width: number, height: number } }) => React.JSX.Element;
  color: string;
  settings: Record<string, Settings>;
}