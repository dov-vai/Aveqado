import {Filter} from "./filter.ts";

export class EqGraphRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private minFreq: number;
    private maxFreq: number;
    private minDb: number;
    private maxDb: number;
    private filters: Filter[];

    constructor(canvas: HTMLCanvasElement, options: {
        width: number;
        height: number;
        minFreq: number;
        maxFreq: number;
        minDb: number;
        maxDb: number;
        filters: Filter[];
    }) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        this.ctx = ctx;

        this.width = options.width;
        this.height = options.height;
        this.minFreq = options.minFreq;
        this.maxFreq = options.maxFreq;
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
        return this.width * (Math.log10(freq) - Math.log10(this.minFreq)) /
            (Math.log10(this.maxFreq) - Math.log10(this.minFreq));
    }

    private xToFreq(x: number): number {
        return Math.pow(10,
            Math.log10(this.minFreq) + (x / this.width) *
            (Math.log10(this.maxFreq) - Math.log10(this.minFreq))
        );
    }

    private dbToY(db: number): number {
        return this.height * (1 - (db - this.minDb) / (this.maxDb - this.minDb));
    }

    private calculateResponse(frequency: number): number {
        let totalGainDb = 0;

        this.filters.forEach((filter: Filter) => {
            if (filter.type === 'peak') {
                const f0 = filter.frequency;
                const Q = filter.Q;
                const gainDb = filter.gain;

                // angular frequency
                const w = 2 * Math.PI * frequency;
                const w0 = 2 * Math.PI * f0;

                // convert gain from dB to linear
                const A = Math.pow(10, gainDb / 40);

                // calculate the frequency response
                const numerator = Math.pow(w * w - w0 * w0, 2) + Math.pow(w * w0 / Q, 2) * Math.pow(A, 2);
                const denominator = Math.pow(w * w - w0 * w0, 2) + Math.pow(w * w0 / Q, 2);

                // convert to dB
                const responseDb = 10 * Math.log10(numerator / denominator);

                totalGainDb += responseDb;
            }
        });

        return totalGainDb;
    }

    private drawFrequencyGrid(): void {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;

        // frequency grid lines (octaves)
        for (let freq = this.minFreq; freq <= this.maxFreq; freq *= 2) {
            const x: number = this.freqToX(freq);
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();

            // label
            this.ctx.fillStyle = '#888';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            const label: string = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
            this.ctx.fillText(label, x, this.height - 5);
        }
    }

    private drawDbGrid(): void {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;

        // dB grid lines
        for (let db = this.minDb; db <= this.maxDb; db += 3) {
            const y: number = this.dbToY(db);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();

            // label
            this.ctx.fillStyle = '#888';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${db}dB`, 25, y + 3);
        }

        // draw 0db line
        const zeroDbY: number = this.dbToY(0);
        this.ctx.strokeStyle = '#aaa';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, zeroDbY);
        this.ctx.lineTo(this.width, zeroDbY);
        this.ctx.stroke();
    }

    private drawResponseCurve(): void {
        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 2;
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