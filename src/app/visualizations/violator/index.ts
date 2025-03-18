import { createSampleSettings } from "../../audio/SampleSettings";
import { Visualization } from "../Visualization";
import { Violator } from "./visualization/Violator";

const violator: Visualization = {
  id: 'violator',
  title: 'Violator',
  artist: 'Depeche Mode',
  design: 'Anton Corbijn',
  imgSrc: require('./violator.jpg'),
  description: "The seventh studio album by English electronic music band Depeche Mode, released on 19 March 1990 by Mute Records. Preceded by the hit singles 'Personal Jesus' and 'Enjoy the Silence', Violator propelled the band into international stardom. The album yielded two further hit singles, 'Policy of Truth' and 'World in My Eyes'.",
  component: Violator,
  color: '#111111',
  settings: {
    samples: createSampleSettings(64, 64),
  }
};

export default violator;