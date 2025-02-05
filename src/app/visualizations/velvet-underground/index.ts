import { createSampleSettings } from "../../audio/SampleSettings";
import { Visualization } from "../Visualization";
import { VelvetUnderground } from "./visualization/VelvetUnderground";

const unknownPleasures: Visualization = {
  id: 'velvet-underground',
  title: 'The Velvet Underground & Nico',
  artist: 'The Velvet Underground & Nico',
  design: 'Andy Warhol',
  imgSrc: require('./velvet-underground.png'),
  description: 'Andy Warhol designed the album cover for The Velvet Underground & Nico, the debut album by the American rock band the Velvet Underground, released in March 1967 by Verve Records. The cover features a yellow banana sticker that can be peeled off to reveal a pink banana underneath. The design was innovative and interactive, reflecting the band\'s avant-garde style and Warhol\'s pop art aesthetic.',
  component: VelvetUnderground,
  color: '#fafafa',
  settings: {
    samples: createSampleSettings(),
  }
};

export default unknownPleasures;