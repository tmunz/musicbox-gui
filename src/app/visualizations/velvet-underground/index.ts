import { Visualization } from "../Visualization";
import { VelvetUnderground } from "./visualization/VelvetUnderground";

const unknownPleasures: Visualization = {
  id: 'velvet-underground',
  title: 'Velvet Underground & Nico',
  artist: 'Velvet Underground & Nico',
  design: 'Andy Warhol',
  imgSrc: require('./velvet-underground.png'),
  description: 'Andy Warhol designed the album cover for The Velvet Underground & Nico, the debut album by the American rock band the Velvet Underground, released in March 1967 by Verve Records. The cover features a yellow banana sticker that can be peeled off to reveal a pink banana underneath. The design was innovative and interactive, reflecting the band\'s avant-garde style and Warhol\'s pop art aesthetic.',
  component: VelvetUnderground,
};

export default unknownPleasures;