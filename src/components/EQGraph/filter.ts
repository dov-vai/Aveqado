export interface Filter {
  type: BiquadFilterType;
  frequency: number;
  Q: number;
  gain: number;
}
