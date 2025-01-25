import { ReactNode } from "react";
import { FixedSizeQueue } from "../utils/FixedSizeQueue";

export interface Visualization {
  id: string;
  title: string;
  imgSrc: string;
  description: ReactNode;
  component: (props: { sampleProvider: FixedSizeQueue<Uint8Array>, canvas: { width: number, height: number } }) => React.JSX.Element;
}