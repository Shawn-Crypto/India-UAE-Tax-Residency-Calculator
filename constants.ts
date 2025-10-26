import { Inputs } from './types';

export const DAYS_TOTAL = 365;
export const AVG_DAYS_IN_MONTH = 365 / 12;

export const DEFAULT_INPUTS: Inputs = {
  c_uae: 10000,
  c_ind: 50000,
  fx: 23.9,
  flights: 30000,
  t_ind: 31.2,
  d_in: 110,
  c_one_time: 0,
  d_uae: 190,
};

export const SENSITIVITY_INCOMES = [
  5_000_000, 10_000_000, 15_000_000, 20_000_000, 30_000_000, 50_000_000, 100_000_000
];