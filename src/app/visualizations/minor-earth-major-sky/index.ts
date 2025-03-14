import { createSampleSettings } from "../../audio/SampleSettings";
import { SettingType } from "../../settings/Setting";
import { Visualization } from "../Visualization";
import { MinorEarthMajorSky } from "./visualization/MinorEarthMajorSky";

const minorEarthMajorSky: Visualization = {
  id: 'minor-earth-major-sky',
  title: 'Minor Earth Major Sky',
  artist: 'A-ha',
  design: 'Kjetil Try, Magne Furuholmen',
  imgSrc: require('./minor-earth-major-sky.jpg'),
  description: "Minor Earth Major Sky is the sixth album by A-ha, released on 17 July 2000. The cover art features a photography showing a vast, open landscape with a airplane already dismanteled.",
  component: MinorEarthMajorSky,
  color: '#aad8e7',
  settings: {
    samples: createSampleSettings(32, 32),
    visualization: {
      intensity: {
        id: 'intensity',
        name: 'intensity',
        description: 'The intensity of the music visualization (dust).',
        type: SettingType.NUMBER,
        value: 1,
        params: {
          min: 0,
          max: 2,
          step: 0.1
        }
      },
    }
  }
};

export default minorEarthMajorSky;