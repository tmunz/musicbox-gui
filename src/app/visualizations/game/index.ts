import { createSampleSettings } from "../../audio/SampleSettings";
import { Visualization } from "../Visualization";
import { Game } from "./visualization/Game";

const game: Visualization = {
  id: 'game',
  title: 'Game',
  artist: 'TODO',
  design: 'TODO',
  imgSrc: '',
  description: "TODO",
  component: Game,
  color: '#00ff00',
  settings: {
    samples: createSampleSettings(32, 32),
  }
};

export default game;
