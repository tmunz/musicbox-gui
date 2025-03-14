import { FixedSizeQueue } from '../utils/FixedSizeQueue';

export class SampleProvider extends FixedSizeQueue<Uint8Array> {

  private _active = false;
  private _frequencyBands = 1;

  constructor(size: number, defaultValue: Uint8Array) {
    super(size, defaultValue);
    this._frequencyBands = defaultValue.length;
  }

  get active() {
    return this._active;
  }

  get frequencyBands() {
    return this._frequencyBands;
  }

  get sampleSize() {
    return this.size;
  }

  get samples() {
    return this.queue;
  }

  push = (sample?: Uint8Array) => {
    if (sample === undefined) {
      this._active = false;
    } else {
      this._active = true;
      super.push(sample);
    }
  }

  flat = () => {
    return this.queue.reduce((acc: Uint8Array, value: Uint8Array, i: number) => {
      acc.set(value, i * this.frequencyBands);
      return acc;
    }, new Uint8Array(this.sampleSize * this.frequencyBands));
  }

  getAvg = (): number[] => {
    return this.queue.map((sample) => {
      return sample.reduce((acc, val) => acc + val, 0) / sample.length;
    });
  }

  // Returns the max value and the index of the sample that contains it for each frequency band (sorted by frequencies from low to high)
  getMax = (): { max: number; sampleIndex: number }[] => {
    if (this.queue.length === 0 || this.queue[0].length === 0) return [];

    return new Array(this.frequencyBands).fill(0).map((_, index: number) => {
      let max = 0;
      let sampleIndex = 0;

      this.queue.forEach((sample, i) => {
        if (sample[index] > max) {
          max = sample[index];
          sampleIndex = i;
        }
      });

      return { max, sampleIndex };
    });
  };
}