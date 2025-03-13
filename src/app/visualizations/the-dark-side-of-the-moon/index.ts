import { createSampleSettings } from "../../audio/SampleSettings";
import { SettingType } from "../../settings/Setting";
import { Visualization } from "../Visualization";
import { TheDarkSideOfTheMoon } from "./TheDarkSideOfTheMoon";

const theDarkSideOfTheMoon: Visualization = {
  id: 'the-dark-side-of-the-moon',
  title: 'The Dark Side of the Moon',
  artist: 'Pink Floyd',
  design: 'Storm Thorgerson (Hipgnosis)',
  imgSrc: require('./dark-side-of-the-moon.png'),
  description: "'The Dark Side of the Moon' is the eighth studio album by the English rock band Pink Floyd, released on March 1, 1973, by Harvest Records. It topped the US Billboard 200 and remained on the chart for an astonishing 741 weeks, from 1973 to 1988. This album's iconic cover is just one of the countless masterpieces created by the design group Hipgnosis, whose work is brilliantly documented in Anton Corbijn's film 'Squaring the Circle'.",
  component: TheDarkSideOfTheMoon,
  color: '#060606',
  settings: {
    samples: createSampleSettings(36, 32),
    visualization: {
      volumeAmountIndicator: {
        id: 'volumeAmountIndicator',
        name: 'volume indicator',
        description: 'The maximum relative length change of the volume indicator.',
        type: SettingType.NUMBER,
        value: 0.6,
        params: {
          min: 0,
          max: 1,
          step: 0.1
        }
      },
      dataRatio: {
        id: 'dataRatio',
        name: 'data ratio',
        description: 'The intensitiy of the data visualization in the rainbow.',
        type: SettingType.NUMBER,
        value: 0.95,
        params: {
          min: 0,
          max: 1,
          step: 0.01
        }
      }
    }
  }
};

export default theDarkSideOfTheMoon;