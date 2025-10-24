export interface Inputs {
  c_uae: number;
  fx: number;
  flights: number;
  t_ind: number;
  d_in: number;
}

export interface SensitivityData {
  income: number;
  tax_saved: number;
  net_gain: number;
}

export interface CalculationResults {
  d_abroad: number;
  c_total: number;
  i_annual_breakeven: number;
  status_india: string;
  status_uae: string;
  sensitivityData: SensitivityData[];
}