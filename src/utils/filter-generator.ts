import {Filter} from "../components/EQGraph/filter.ts";
import {RandomUtils} from "./random-utils.ts";

export class FilterGenerator {
    private readonly minDb: number;
    private readonly maxDb: number;
    private readonly freqs: number[];
    private readonly Q: number;

    constructor(minFreq: number, maxFreq: number, freqMultiplier: number, minDb: number, maxDb: number) {
        this.minDb = minDb;
        this.maxDb = maxDb;
        this.freqs = this.calculateCenterFreqs(minFreq, maxFreq, freqMultiplier);
        this.Q = this.calculateQ(minFreq, minFreq * freqMultiplier);
    }

    private calculateQ(freqLow: number, freqHigh: number): number {
        const centerFreq = this.getRegionCenterFreq(freqLow, freqHigh);

        return centerFreq / (freqHigh - freqLow);
    }

    private getRegionCenterFreq(freqLow: number, freqHigh: number): number {
        return Math.sqrt(freqLow * freqHigh);
    };

    private calculateCenterFreqs(minFreq: number, maxFreq: number, multiplier: number): number[] {
        const freqs: number[] = [];

        for (let freq = minFreq; freq < maxFreq; freq *= multiplier) {
            const centerFreq = this.getRegionCenterFreq(freq, freq * multiplier);
            freqs.push(centerFreq);
        }

        return freqs;
    }

    public generate(): Filter {
        const randomIdx = RandomUtils.getRndInteger(0, this.freqs.length)
        let randomGain = RandomUtils.getRndInteger(this.minDb, this.maxDb);
        randomGain = RandomUtils.getRndInteger(0, 2) ? randomGain : -randomGain;

        return {
            type: "peaking",
            frequency: this.freqs[randomIdx],
            gain: randomGain,
            Q: this.Q
        };
    }
}