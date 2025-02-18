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

  getAvg = () => {
    return this.queue.map((sample) => {
      return sample.reduce((acc, val) => acc + val, 0) / sample.length;
    });
  }
}