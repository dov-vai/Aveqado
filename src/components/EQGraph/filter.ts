export type FilterType = 'peak';

export interface Filter {
    type: FilterType;
    frequency: number;
    Q: number;
    gain: number;
}