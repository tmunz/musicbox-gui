import { createSampleSettings } from "../../audio/SampleSettings";
import { Visualization } from "../Visualization";
import { VivaLaVida } from "./visualization/VivaLaVida";

const vivaLaVida: Visualization = {
  id: 'viva-la-vida',
  title: 'Viva la Vida',
  artist: 'Coldplay',
  design: 'Coldplay & Eugène Delacroix',
  imgSrc: require('./viva-la-vida.jpg'),
  description: "'Viva la Vida or Death and All His Friends' is the fourth studio album by the British rock band Coldplay, released on June 12, 2008. The album's artwork is a painting by French artist Eugène Delacroix, titled 'Liberty Leading the People', which was modified by Coldplay's drummer Will Champion. The painting depicts the July Revolution of 1830 in France, and the album's title translates to 'Long Live Life'.",
  component: VivaLaVida,
  color: '#342b1c',
  settings: {
    samples: createSampleSettings(32, 32),
  }
};

export default vivaLaVida;