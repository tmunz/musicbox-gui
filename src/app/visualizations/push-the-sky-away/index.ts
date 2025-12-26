import { createSampleSettings } from '../../audio/SampleSettings';
import { Visualization } from '../Visualization';
import { PushTheSkyAway } from './visualization/PushTheSkyAway';

const pushTheSkyAway: Visualization = {
  id: 'push-the-sky-away',
  title: 'Push the Sky Away',
  artist: 'Nick Cave & The Bad Seeds',
  design: 'Tom Hingston',
  imgSrc: require('./push-the-sky-away.jpg'),
  description:
    "'Push the Sky Away' is the fifteenth studio album by Nick Cave and the Bad Seeds, released on 18 February 2013. The cover features a black-and-white photograph by Dominique Issermann showing Nick Cave and his wife Susie Bick in their own bedroom. This personal setting creates an intimate, almost dreamlike atmosphere that mirrors the album's introspective and fragile mood. The soft lighting and minimal composition add to the sense of quiet tension, making the artwork as evocative and mysterious as the music itself.",
  component: PushTheSkyAway,
  color: '#cccccc',
  settings: {
    samples: createSampleSettings(32, 16),
  },
};

export default pushTheSkyAway;
