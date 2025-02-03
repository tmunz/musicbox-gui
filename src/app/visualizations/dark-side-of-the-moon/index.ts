import { createSampleSettings } from "../../audio/SampleSettings";
import { Visualization } from "../Visualization";
import { DarkSideOfTheMoon } from "./DarkSideOfTheMoon";

const darkSideOfTheMoon: Visualization = {
  id: 'dark-side-of-the-moon',
  title: 'Dark Side of the Moon',
  artist: 'Pink Floyd',
  design: 'Storm Thorgerson (Hipgnosis)',
  imgSrc: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png',
  description: "'The Dark Side of the Moon' is the eighth studio album by the English rock band Pink Floyd, released on March 1, 1973, by Harvest Records. It topped the US Billboard 200 and remained on the chart for an astonishing 741 weeks, from 1973 to 1988. This album's iconic cover is just one of the countless masterpieces created by the design group Hipgnosis, whose work is brilliantly documented in Anton Corbijn's film 'Squaring the Circle'.",
  component: DarkSideOfTheMoon,
  color: '#060606',
  settings: {
    samples: createSampleSettings(),
  }
};

export default darkSideOfTheMoon;