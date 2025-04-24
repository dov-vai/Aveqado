export class AudioUtils {

    private constructor() {
    }

    static generateBands(minFreq: number, maxFreq: number, bands: number): number[] {
        const frequencies = [];

        const ratio = maxFreq / minFreq;
        const multiplier = Math.pow(ratio, 1 / (bands - 1));

        for (let i = 0; i < bands; i++) {
            const freq = minFreq * Math.pow(multiplier, i);
            frequencies.push(Math.round(freq));
        }

        return frequencies;
    }
}