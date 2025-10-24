import { Inputs } from './types';

export const DAYS_TOTAL = 365;
export const D_UAE = 190; // Fixed (cannot be changed) – TRC safe zone
export const M_UAE = 6.3; // Corresponds to ~190 days

export const DEFAULT_INPUTS: Inputs = {
  c_uae: 25000,
  fx: 23.9,
  flights: 61400,
  t_ind: 31.2,
  d_in: 110,
};

export const SENSITIVITY_INCOMES = [
  5_000_000, 10_000_000, 15_000_000, 20_000_000, 30_000_000, 50_000_000, 100_000_000
];