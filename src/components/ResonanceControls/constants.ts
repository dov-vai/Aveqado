import { Filter } from '../EQGraph/filter';

export const defaultFilters: Filter[] = [
  { type: 'peaking', frequency: 3000, Q: 5, gain: -3 },
  { type: 'peaking', frequency: 9000, Q: 5, gain: -2 },
  { type: 'peaking', frequency: 15000, Q: 5, gain: -1 },
];
