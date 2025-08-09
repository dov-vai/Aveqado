import { Filter } from '../components/EQGraph/filter.ts';

export class EqUtils {
  private constructor() {}

  static generateBands(
    minFreq: number,
    maxFreq: number,
    bands: number
  ): number[] {
    const frequencies = [];

    const ratio = maxFreq / minFreq;
    const multiplier = Math.pow(ratio, 1 / (bands - 1));

    for (let i = 0; i < bands; i++) {
      const freq = minFreq * Math.pow(multiplier, i);
      frequencies.push(Math.round(freq));
    }

    return frequencies;
  }

  static freqToX(
    freq: number,
    width: number,
    minFreq: number,
    maxFreq: number
  ): number {
    return (
      (width * (Math.log10(freq) - Math.log10(minFreq))) /
      (Math.log10(maxFreq) - Math.log10(minFreq))
    );
  }

  static xToFreq(
    x: number,
    width: number,
    minFreq: number,
    maxFreq: number
  ): number {
    return Math.pow(
      10,
      Math.log10(minFreq) +
        (x / width) * (Math.log10(maxFreq) - Math.log10(minFreq))
    );
  }

  static dbToY(
    db: number,
    height: number,
    minDb: number,
    maxDb: number
  ): number {
    return height * (1 - (db - minDb) / (maxDb - minDb));
  }

  static getCenterFreq(freqLow: number, freqHigh: number): number {
    return Math.sqrt(freqLow * freqHigh);
  }

  static calculateQ(freqLow: number, freqHigh: number): number {
    const centerFreq = this.getCenterFreq(freqLow, freqHigh);

    return centerFreq / (freqHigh - freqLow);
  }

  static filterEquals = (filter1: Filter, filter2: Filter) => {
    return (
      filter1.type === filter2.type &&
      filter1.frequency === filter2.frequency &&
      filter1.Q === filter2.Q &&
      filter1.gain === filter2.gain
    );
  };
}
