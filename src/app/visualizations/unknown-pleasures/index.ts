import { createSampleSettings } from "../../audio/SampleSettings";
import { SettingType } from "../../settings/Setting";
import { Visualization } from "../Visualization";
import { UnknownPleasures } from "./visualization/UnknownPleasures";

const unknownPleasures: Visualization = {
  id: 'unknown-pleasures',
  title: 'Unknown Pleasures',
  artist: 'Joy Division',
  design: 'Peter Saville (Factory Records)',
  imgSrc: require('./unknown-pleasures.png'),
  description: 'Unknown Pleasures is the debut studio album by English rock band Joy Division, released on 15 June 1979 by Factory Records. The artwork shows waveforms representing data from the first recorded pulsar, PSR B1919+21, which Saville took from an astronomy encyclopedia and inverted it. Stripped of context, the minimalist yet striking design conveys a sense of mystery and introspection, mirroring the haunting and atmospheric music of the album.',
  component: UnknownPleasures,
  settings: {
    samples: createSampleSettings(64, 16),
    visualization: {
      noise: {
        id: 'noise',
        name: 'Noise',
        description: 'The level of noise introduced to the waveform to mimic the warmth and imperfections of analog signals.',
        type: SettingType.NUMBER,
        value: 0.1,
        params: {
          min: 0,
          max: 1,
          step: 0.01
        }
      }
    }
  }
};

export default unknownPleasures;