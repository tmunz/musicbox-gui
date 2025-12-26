import { createSampleSettings } from '../../audio/SampleSettings';
import { Visualization } from '../Visualization';
import { TransEuropeExpress } from './visualization/TransEuropeExpress';

const transEuropeExpress: Visualization = {
  id: 'trans-europe-express',
  title: 'Trans Europe Express',
  artist: 'Kraftwerk',
  design: 'Emil Schult',
  imgSrc: require('./trans-europe-express.jpg'),
  description:
    'Trans-Europe Express is the sixth studio album by Kraftwerk, recorded in 1976 and released in March 1977. The album became a revolutionary landmark in electronic music, influencing genres from post-punk to hip-hop. The 2009 remaster features a striking black background with a white Trans Europ Express train silhouette at its center, capturing the album\'s pioneering fusion of man and machine. From the influential title track to the hauntingly beautiful "The Hall of Mirrors", the album remains a cornerstone of synthetic music that continues to inspire artists across generations.',
  component: TransEuropeExpress,
  color: '#0a0a0a',
  settings: {
    samples: createSampleSettings(32, 16),
  },
};

export default transEuropeExpress;
