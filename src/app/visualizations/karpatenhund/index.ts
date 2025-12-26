import { createSampleSettings } from '../../audio/SampleSettings';
import { Visualization } from '../Visualization';
import { Karpatenhund } from './visualization/Karpatenhund';

const karpatenhund: Visualization = {
  id: 'karpatenhund-3',
  title: '#3',
  artist: 'Karpatenhund',
  design: 'Stefanie Schrank (Karpatenhund)',
  imgSrc: require('./karpatenhund_3.jpg'),
  description:
    "In 2007, the German band Karpatenhund released their first studio album, #3, following three EPs (starting with #0). The album's artwork, designed by bassist and artist Stefanie Schrank, reflects the band's distinctive fusion of music and visual appearance. Her artistic style, known for its bold, graphic elements and surreal touches, perfectly complements the album's eclectic sound, making the visual presentation as striking as the music itself.",
  component: Karpatenhund,
  color: '#fda600',
  settings: {
    samples: createSampleSettings(32, 1),
  },
};

export default karpatenhund;
