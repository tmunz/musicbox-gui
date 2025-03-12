export const random = (seed: number = 0, min = 0, max = 1): number => {
  let n: number; // [0, 1[
  if (typeof seed !== 'undefined') {
    // Mulberry32
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    n = ((t ^ (t >>> 14)) >>> 0) / 0xffffffff;
  } else {
    n = Math.random();
  }
  return n * (max - min) + min;
};