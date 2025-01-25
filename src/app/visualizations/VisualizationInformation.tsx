import React from "react";
import { Visualization } from "./Visualization";

export const VisualizationInformation = ({ visualization }: { visualization: Visualization }) => {
  return (
    <div>
      <img src={visualization.imgSrc} alt={visualization.title} />
      <h1>{visualization.title}</h1>
      <div>
        {visualization.description}
      </div>
    </div>
  );
}