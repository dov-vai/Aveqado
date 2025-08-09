import { Filter } from '../components/EQGraph/filter.ts';

const TYPE_MAP: Record<BiquadFilterType, string> = {
  peaking: 'PK',
  lowpass: 'LP',
  highpass: 'HP',
  lowshelf: 'LS',
  highshelf: 'HS',
  notch: 'NO',
  allpass: 'AP',
  bandpass: 'BP',
};

export class FilterExport {
  private constructor() {}

  static exportFiltersAPO(filters: Filter[], preamp = 0): string {
    const lines: string[] = [];
    lines.push(`Preamp: ${this.formatOne(preamp)} db`);
    filters.forEach((f, i) => {
      const type = TYPE_MAP[f.type] ?? 'PK';
      const fc = this.formatFreq(f.frequency);
      const gain = this.formatOne(f.gain);
      const q = this.formatOne(f.Q);
      lines.push(
        `Filter ${i + 1}: ON ${type} Fc ${fc} Hz Gain ${gain} dB Q ${q}`
      );
    });
    return lines.join('\n');
  }

  private static formatOne(n: number): string {
    return this.trimZeros(n.toFixed(1));
  }

  private static formatFreq(n: number): string {
    const rounded = Math.round(n);
    if (Math.abs(n - rounded) < 1e-6) return String(rounded);
    return this.trimZeros(n.toFixed(1));
  }

  private static trimZeros(s: string): string {
    return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }
}
