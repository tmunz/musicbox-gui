import { createSampleSettings } from '../../audio/SampleSettings';
import { Visualization } from '../Visualization';
import { Santigold } from './visualization/Santigold';

const santigold: Visualization = {
  id: 'santigold',
  title: 'Santigold',
  artist: 'Santigold',
  design: 'Isabelle Lumpkin',
  imgSrc: require('./santigold.jpg'),
  description:
    "Santigold's self-titled debut album, Santigold, was released in 2008 and quickly became a defining record of the late 2000s. Blending elements of new wave, punk, reggae, and electronic music, the album showcased Santigold's genre-defying sound and innovative production. Songs like 'L.E.S. Artistes', 'Creator', and 'Shove It' became anthems, earning her comparisons to artists like M.I.A. and the Yeah Yeah Yeahs while still carving out her own distinct identity.",
  component: Santigold,
  color: '#dfe0f3',
  settings: {
    samples: createSampleSettings(32, 32),
  },
};

export default santigold;
