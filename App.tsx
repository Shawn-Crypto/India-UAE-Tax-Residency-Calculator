import React, { useState, useEffect, useCallback } from 'react';
import { Inputs, CalculationResults } from './types';
import { DEFAULT_INPUTS, DAYS_TOTAL, SENSITIVITY_INCOMES, AVG_DAYS_IN_MONTH } from './constants';
import { InputField } from './components/InputField';
import { SummaryCard } from './components/SummaryCard';
import { SensitivityTable } from './components/SensitivityTable';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((currentInputs: Inputs): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    const { c_uae, c_ind, fx, flights, t_ind, d_in, c_one_time, d_uae } = currentInputs;

    if (c_uae < 0) newErrors.c_uae = 'Cost must be non-negative.';
    if (c_ind < 0) newErrors.c_ind = 'Cost must be non-negative.';
    if (fx <= 0) newErrors.fx = 'Rate must be positive.';
    if (flights < 0) newErrors.flights = 'Cost must be non-negative.';
    if (c_one_time < 0) newErrors.c_one_time = 'Cost must be non-negative.';
    if (t_ind < 0 || t_ind > 100) newErrors.t_ind = 'Rate must be between 0 and 100.';
    
    if (d_uae < 190) {
      newErrors.d_uae = 'Must be >= 190 for TRC safe zone.';
    } else if (d_uae > 365) {
      newErrors.d_uae = 'Cannot exceed 365 days.';
    }
    
    const maxDaysInIndia = DAYS_TOTAL - d_uae;
    if (d_in < 0 || d_in > maxDaysInIndia) {
        newErrors.d_in = `Days must be between 0 and ${Math.floor(maxDaysInIndia)}.`;
    }
    
    return newErrors;
  }, []);
  
  const calculate = useCallback(() => {
    const { c_uae, c_ind, fx, flights, t_ind, d_in, c_one_time, d_uae } = inputs;
    
    const t_ind_decimal = t_ind / 100;

    const d_abroad = DAYS_TOTAL - (d_uae + d_in);
    
    // Calculate total costs for the period of stay, prorated by exact days
    const c_uae_daily = c_uae / AVG_DAYS_IN_MONTH;
    const c_ind_daily = c_ind / AVG_DAYS_IN_MONTH;

    const c_uae_total_inr = (c_uae_daily * d_uae * fx) + flights;
    const c_ind_total_inr = c_ind_daily * d_uae; // This is the cost you avoid by moving

    // The true incremental cost is the difference between the two full costs plus one-time setup costs
    const c_incremental = c_uae_total_inr - c_ind_total_inr + c_one_time;

    const i_annual_breakeven = t_ind_decimal > 0 ? c_incremental / t_ind_decimal : 0;

    let status_india: string;
    const d_in_int = Math.floor(d_in); // Use whole days for status calculation

    if (d_in_int < 111) {
      status_india = "Non-Resident (NRI)";
    } else if (d_in_int < 182) {
      status_india = "Resident but Not Ordinarily Resident (RNOR)";
    } else {
      status_india = "Resident (Taxable on Global Income)";
    }

    const status_uae = d_uae >= 183 ? "UAE Tax Resident (TRC Eligible)" : "Not TRC Eligible";

    const sensitivityData = SENSITIVITY_INCOMES.map(income => {
      const tax_saved = income * t_ind_decimal;
      const net_gain = tax_saved - c_incremental;
      return { income, tax_saved, net_gain };
    });

    setResults({
      d_abroad,
      c_total: c_incremental, // c_total now represents the incremental cost
      i_annual_breakeven,
      status_india,
      status_uae,
      sensitivityData,
    });
  }, [inputs]);

  useEffect(() => {
    const validationErrors = validate(inputs);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
        calculate();
    } else {
        setResults(null);
    }
  }, [inputs, calculate, validate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
            India vs UAE Tax Residency Calculator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Analyze the financial implications of becoming a UAE tax resident.
          </p>
          <div className="mt-4 max-w-3xl mx-auto text-sm text-gray-300 leading-relaxed">
            <p>
              Determine your tax residency status between UAE and India using the 183-day rule. This calculator helps you understand whether you qualify as a Non-Resident Indian (NRI), Resident but Not Ordinarily Resident (RNOR), or fully taxable resident under Indian tax laws. It factors in UAE Tax Residency Certificate (TRC) eligibility and Double Tax Avoidance Agreement (DTAA) considerations to optimize your tax planning between both countries.
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
            <h2 className="text-xl font-bold mb-6 text-white">Your Inputs</h2>
            <div className="space-y-6">
              <InputField id="d_uae" label="Days in UAE" value={inputs.d_uae} onChange={handleInputChange} description=">=190 recommended for TRC safe zone" min={190} max={365} error={errors.d_uae} />
              <InputField id="c_uae" label="Monthly Cost of Living in UAE" value={inputs.c_uae} onChange={handleInputChange} description="in AED" min={0} error={errors.c_uae} />
              <InputField id="c_ind" label="Monthly Cost of Living in India" value={inputs.c_ind} onChange={handleInputChange} description="Post-tax spend, if you stayed" step={1000} symbol="₹" min={0} error={errors.c_ind}/>
              <InputField id="fx" label="AED to INR Exchange Rate" value={inputs.fx} onChange={handleInputChange} description="Current rate" step={0.01} min={0.01} error={errors.fx} />
              <InputField id="flights" label="Total Flight Cost" value={inputs.flights} onChange={handleInputChange} description="For 2 people, in INR" step={1000} symbol="₹" min={0} error={errors.flights}/>
              <InputField id="c_one_time" label="One-Time Relocation Costs" value={inputs.c_one_time} onChange={handleInputChange} description="e.g., Visa, deposits, furniture" step={10000} symbol="₹" min={0} error={errors.c_one_time} />
              <InputField id="t_ind" label="Effective Indian Tax Rate" value={inputs.t_ind} onChange={handleInputChange} description="As a percentage" step={0.1} symbol="%" symbolPosition="after" min={0} max={100} error={errors.t_ind} />
              <InputField id="d_in" label="Days in India" value={inputs.d_in} onChange={handleInputChange} description="<=110 recommended for NRI status" min={0} max={DAYS_TOTAL - inputs.d_uae} error={errors.d_in} />
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-8">
            {results ? (
              <>
                <SummaryCard results={results} d_uae={inputs.d_uae} d_in={inputs.d_in} formatCurrency={formatCurrency} />
                <SensitivityTable data={results.sensitivityData} formatCurrency={formatCurrency} />
              </>
            ) : (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full flex items-center justify-center min-h-[300px]">
                <p className="text-gray-400 text-center">
                  Enter valid inputs to see the residency summary and sensitivity analysis.
                </p>
              </div>
            )}
          </div>
        </main>
        
        <footer className="text-center mt-10 pt-6 border-t border-gray-700 text-xs text-gray-500">
          <p className="mb-2">
            Disclaimer: This calculator is for informational purposes only and does not constitute financial or tax advice. Consult with a qualified professional for your specific situation.
          </p>
          <p>
            vibed coded by <a href="https://x.com/shawnpwn" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-semibold">@shawnpwn</a>. Not financial advice.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;