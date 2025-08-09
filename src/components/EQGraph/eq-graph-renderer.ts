import { Filter } from './filter.ts';
import { ThemeColors } from '../../utils/theme-colors.ts';
import { EqUtils } from '../../utils/eq-utils.ts';

export class EqGraphRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private minFreq: number;
  private maxFreq: number;
  private bands: number;
  private minDb: number;
  private maxDb: number;
  private filters: Filter[];

  constructor(
    canvas: HTMLCanvasElement,
    options: {
      width: number;
      height: number;
      minFreq: number;
      maxFreq: number;
      bands: number;
      minDb: number;
      maxDb: number;
      filters: Filter[];
    }
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    this.width = options.width;
    this.height = options.height;
    this.minFreq = options.minFreq;
    this.maxFreq = options.maxFreq;
    this.bands = options.bands;
    this.minDb = options.minDb;
    this.maxDb = options.maxDb;
    this.filters = options.filters;

    this.setupCanvas();
  }

  private setupCanvas(): void {
    const scale = window.devicePixelRatio || 1;
    this.canvas.width = this.width * scale;
    this.canvas.height = this.height * scale;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(scale, scale);
  }

  private freqToX(freq: number): number {
    return EqUtils.freqToX(freq, this.width, this.minFreq, this.maxFreq);
  }

  private xToFreq(x: number): number {
    return EqUtils.xToFreq(x, this.width, this.minFreq, this.maxFreq);
  }

  private dbToY(db: number): number {
    return EqUtils.dbToY(db, this.height, this.minDb, this.maxDb);
  }

  private calculateResponse(frequency: number): number {
    let totalGainDb = 0;

    this.filters.forEach((filter: Filter) => {
      if (filter.type === 'peaking') {
        const f0 = filter.frequency;
        const Q = filter.Q;
        const gainDb = filter.gain;

        // angular frequency
        const w = 2 * Math.PI * frequency;
        const w0 = 2 * Math.PI * f0;

        // convert gain from dB to linear
        const A = Math.pow(10, gainDb / 40);

        // calculate the frequency response
        const numerator =
          Math.pow(w * w - w0 * w0, 2) +
          Math.pow((w * w0) / Q, 2) * Math.pow(A, 2);
        const denominator =
          Math.pow(w * w - w0 * w0, 2) + Math.pow((w * w0) / Q, 2);

        // convert to dB
        const responseDb = 10 * Math.log10(numerator / denominator);

        totalGainDb += responseDb;
      }
    });

    return totalGainDb;
  }

  private drawFrequencyGrid(): void {
    this.ctx.strokeStyle = ThemeColors.LineColor;
    this.ctx.lineWidth = 0.5;

    // frequency grid lines (octaves)
    const freqs = EqUtils.generateBands(this.minFreq, this.maxFreq, this.bands);

    for (const freq of freqs) {
      const x: number = this.freqToX(freq);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
  }

  private drawDbGrid(): void {
    this.ctx.strokeStyle = ThemeColors.LineColor;
    this.ctx.lineWidth = 0.5;

    // dB grid lines
    for (let db = this.minDb; db <= this.maxDb; db += 3) {
      const y: number = this.dbToY(db);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // draw 0db line
    const zeroDbY: number = this.dbToY(0);
    this.ctx.strokeStyle = ThemeColors.LineColor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, zeroDbY);
    this.ctx.lineTo(this.width, zeroDbY);
    this.ctx.stroke();
  }

  private drawResponseCurve(): void {
    this.ctx.strokeStyle = ThemeColors.AccentColor;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();

    for (let x = 0; x < this.width; x++) {
      const freq: number = this.xToFreq(x);
      const response: number = this.calculateResponse(freq);
      const y: number = this.dbToY(response);

      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  public draw(): void {
    // reset transformations
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.setupCanvas();

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawFrequencyGrid();
    this.drawDbGrid();
    this.drawResponseCurve();
  }
}
