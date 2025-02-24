import { createSampleSettings } from '../../audio/SampleSettings';
import { Visualization } from '../Visualization';
import { UnknownPleasures } from './visualization/UnknownPleasures';

const unknownPleasures: Visualization = {
  id: 'unknown-pleasures',
  title: 'Unknown Pleasures',
  artist: 'Joy Division',
  design: 'Peter Saville (Factory Records)',
  imgSrc: require('./unknown-pleasures.png'),
  description: 'Unknown Pleasures is the debut studio album by English rock band Joy Division, released on 15 June 1979 by Factory Records. The artwork shows waveforms representing data from the first recorded pulsar, PSR B1919+21, which Saville took from an astronomy encyclopedia and inverted it. Stripped of context, the minimalist yet striking design conveys a sense of mystery and introspection, mirroring the haunting and atmospheric music of the album.',
  component: UnknownPleasures,
  color: '#000000',
  settings: {
    samples: createSampleSettings(80, 32),
  }
};

export default unknownPleasures;