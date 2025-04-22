export class RandomUtils {
    private constructor() {
    }

    static getRndInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}