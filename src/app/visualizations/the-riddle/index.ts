import { createSampleSettings } from "../../audio/SampleSettings";
import { Visualization } from "../Visualization";
import { TheRiddle } from "./visualization/TheRiddle";

const theRiddle: Visualization = {
  id: 'the-riddle',
  title: 'The Riddle',
  artist: 'Gigi D\'Agostino',
  design: 'TODO',
  imgSrc: 'TODO',
  description: "This is actually not an album cover art, it is a visualization inspired by the iconic music video of Gigi D'Agostino's track. The landscape is shaped by the audio samples, and you can start the experience to see music and visual movement interact.",
  component: TheRiddle,
  color: '#01A101',
  settings: {
    samples: createSampleSettings(32, 64),
  }
};

export default theRiddle;
