import {Filter} from "../components/EQGraph/filter.ts";
import {RandomUtils} from "./random-utils.ts";
import {EqUtils} from "./eq-utils.ts";

export class FilterGenerator {
    private readonly minDb: number;
    private readonly maxDb: number;
    private readonly centerFreqs: number[];
    private readonly Q: number;

    constructor(minFreq: number, maxFreq: number, bands: number, minDb: number, maxDb: number) {
        if (bands < 2) {
            throw new Error("FilterGenerator: bands must be >= 2");
        }

        this.minDb = minDb;
        this.maxDb = maxDb;
        const freqs = EqUtils.generateBands(minFreq, maxFreq, bands);
        this.centerFreqs = this.calculateCenterFreqs(freqs);
        this.Q = EqUtils.calculateQ(freqs[0], freqs[1]);
    }

    private calculateCenterFreqs(freqs: number[]): number[] {
        const centerFreqs: number[] = [];

        for (let i = 0; i < freqs.length - 1; i++) {
            const centerFreq = EqUtils.getCenterFreq(freqs[i], freqs[i + 1]);
            centerFreqs.push(centerFreq);
        }

        return centerFreqs;
    }

    public generate(): Filter {
        const randomIdx = RandomUtils.getRndInteger(0, this.centerFreqs.length)
        let randomGain = RandomUtils.getRndInteger(this.minDb, this.maxDb);
        randomGain = RandomUtils.getRndInteger(0, 2) ? randomGain : -randomGain;

        return {
            type: "peaking",
            frequency: this.centerFreqs[randomIdx],
            gain: randomGain,
            Q: this.Q
        };
    }
}