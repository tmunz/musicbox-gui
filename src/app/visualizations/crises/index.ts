import { createSampleSettings } from '../../audio/SampleSettings';
import { Visualization } from '../Visualization';
import { Crises } from './visualization/Crises';

const crises: Visualization = {
  id: 'crises',
  title: 'Crises',
  artist: 'Mike Oldfield',
  design: 'Terry Ilott',
  imgSrc: require('./crises.jpg'),
  description:
    "'Crises' is the eighth studio album by English multi-instrumentalist and songwriter Mike Oldfield, released on 27 May 1983. The artwork features a surreal cityscape with a massive moon, creating an eerie yet captivating atmosphere. The artwork draws on motifs from the different songs of the album like the haunting 'Moonlight Shadow' or the powerful 'Shadow on the Wall'.",
  component: Crises,
  color: '#12745f',
  settings: {
    samples: createSampleSettings(64, 64),
  },
};

export default crises;
