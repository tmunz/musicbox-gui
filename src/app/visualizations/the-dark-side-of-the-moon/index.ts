import { createSampleSettings } from '../../audio/SampleSettings';
import { SettingType } from '../../settings/Setting';
import { Visualization } from '../Visualization';
import { TheDarkSideOfTheMoon } from './TheDarkSideOfTheMoon';
import { MAX_BOUNCES } from './components/Beam';

const theDarkSideOfTheMoon: Visualization = {
  id: 'the-dark-side-of-the-moon',
  title: 'The Dark Side of the Moon',
  artist: 'Pink Floyd',
  design: 'Storm Thorgerson (Hipgnosis)',
  imgSrc: require('./the-dark-side-of-the-moon.png'),
  description:
    "'The Dark Side of the Moon' is the eighth studio album by the English rock band Pink Floyd, released on March 1, 1973, by Harvest Records. It topped the US Billboard 200 and remained on the chart for an astonishing 741 weeks, from 1973 to 1988. This album's iconic cover is just one of the countless masterpieces created by the design group Hipgnosis, whose work is brilliantly documented in Anton Corbijn's film 'Squaring the Circle'.",
  component: TheDarkSideOfTheMoon,
  color: '#060606',
  settings: {
    samples: createSampleSettings(36, 32),
    visualization: {
      volumeAmountIndicator: {
        id: 'volumeAmountIndicator',
        name: 'Volume Indicator',
        description: 'The maximum relative length change of the volume indicator.',
        type: SettingType.NUMBER,
        value: 0.6,
        params: {
          min: 0,
          max: 1,
          step: 0.1,
        },
      },
      dataRatio: {
        id: 'dataRatio',
        name: 'Data Ratio',
        description: 'The intensity of the data visualization in the rainbow.',
        type: SettingType.NUMBER,
        value: 0.95,
        params: {
          min: 0,
          max: 1,
          step: 0.01,
        },
      },
      pointerSensitivity: {
        id: 'pointerSensitivity',
        name: 'Pointer Sensitivity',
        description: 'Controls how much the mouse movement affects the animation.',
        type: SettingType.NUMBER,
        value: 0.02,
        params: {
          min: 0.0,
          max: 1.0,
          step: 0.01,
        },
      },
      maxBounces: {
        id: 'maxBounces',
        name: 'Max Bounces',
        description: 'The maximum number of beam bounces in the prism.',
        type: SettingType.NUMBER,
        value: 5,
        params: {
          min: 0,
          max: MAX_BOUNCES,
          step: 1,
        },
      },
      deflection: {
        id: 'deflection',
        name: 'Deflection',
        description: 'The angle of beam deflection.',
        type: SettingType.NUMBER,
        value: 36,
        params: {
          min: 0,
          max: 90,
          step: 1,
        },
      },
    },
  },
};

export default theDarkSideOfTheMoon;
