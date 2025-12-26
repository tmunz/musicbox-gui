import { createSampleSettings } from '../../audio/SampleSettings';
import { SettingType } from '../../settings/Setting';
import { Visualization } from '../Visualization';
import { ChvrchesEveryOpenEye } from './visualization/ChvrchesEveryOpenEye';

const chvrchesEveryOpenEye: Visualization = {
  id: 'chvrches-every-eye-open',
  title: 'Every Open Eye',
  artist: 'CHVRCHES',
  design: 'Amy Burrows',
  imgSrc: require('./chvrches-every-open-eye.jpg'),
  description:
    "The cover art for Every Open Eye by CHVRCHES (2015), designed by Amy Burrows, features a mosaic of iridescent, pastel-colored floral patterns. Created using a layered, cut-paper technique, the design has a textured, handcrafted quality that mirrors the band's shimmering synth-pop sound. The artwork draws a notable parallel to Power, Corruption & Lies by New Order, which also juxtaposes vibrant floral imagery with electronic music. Both covers use organic visuals to contrast and complement their synthetic soundscapes, reinforcing the emotional depth within their respective albums.",
  component: ChvrchesEveryOpenEye,
  color: '#ded6d4',
  settings: {
    samples: createSampleSettings(64, 32),
    visualization: {
      visibilityThreshold: {
        id: 'visibilityThreshold',
        name: 'Visibility Threshold',
        description: 'The relative minimum of the frequency value for a tile to be visible.',
        type: SettingType.NUMBER,
        value: 0.5,
        params: {
          min: 0,
          max: 1,
          step: 0.1,
        },
      },
      backgroundImage: {
        id: 'backgroundImage',
        name: 'Background Image',
        description: 'Visibility of the background image',
        type: SettingType.NUMBER,
        value: 0,
        params: {
          min: 0,
          max: 1,
          step: 0.1,
        },
      },
    },
  },
};

export default chvrchesEveryOpenEye;
