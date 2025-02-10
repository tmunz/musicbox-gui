import { FixedSizeQueue } from '../utils/FixedSizeQueue';

export class SampleProvider extends FixedSizeQueue<Uint8Array> {
  constructor(size: number, defaultValue: Uint8Array) {
    super(size, defaultValue);
  }
}