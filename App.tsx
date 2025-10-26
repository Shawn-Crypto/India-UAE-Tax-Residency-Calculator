
import React, { useState, useEffect, useCallback } from 'react';
import { Inputs, CalculationResults } from './types';
import { DEFAULT_INPUTS, DAYS_TOTAL, D_UAE, SENSITIVITY_INCOMES, M_UAE } from './constants';
import { InputField } from './components/InputField';
import { SummaryCard } from './components/SummaryCard';
import { SensitivityTable } from './components/SensitivityTable';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((currentInputs: Inputs): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    const { c_uae, fx, flights, t_ind, d_in } = currentInputs;

    if (c_uae < 0) newErrors.c_uae = 'Cost must be non-negative.';
    if (fx <= 0) newErrors.fx = 'Rate must be positive.';
    if (flights < 0) newErrors.flights = 'Cost must be non-negative.';
    if (t_ind < 0 || t_ind > 100) newErrors.t_ind = 'Rate must be between 0 and 100.';
    
    const maxDaysInIndia = DAYS_TOTAL - D_UAE;
    if (d_in < 0 || d_in > maxDaysInIndia) {
        newErrors.d_in = `Days must be between 0 and ${maxDaysInIndia}.`;
    }
    
    return newErrors;
  }, []);
  
  const calculate = useCallback(() => {
    const { c_uae, fx, flights, t_ind, d_in } = inputs;
    
    const t_ind_decimal = t_ind / 100;

    const d_abroad = DAYS_TOTAL - (D_UAE + d_in);
    const c_total = (c_uae * fx * M_UAE) + flights;
    const i_annual_breakeven = t_ind_decimal > 0 ? c_total / t_ind_decimal : 0;

    let status_india: string;
    if (d_in <= 110) {
      status_india = "Non-Resident (NRI)";
    } else if (d_in >= 111 && d_in < 182) {
      status_india = "Resident but Not Ordinarily Resident (RNOR)";
    } else {
      status_india = "Resident (Taxable on Global Income)";
    }

    const status_uae = D_UAE >= 183 ? "UAE Tax Resident (TRC Eligible)" : "Not TRC Eligible";

    const sensitivityData = SENSITIVITY_INCOMES.map(income => {
      const tax_saved = income * t_ind_decimal;
      const net_gain = tax_saved - c_total;
      return { income, tax_saved, net_gain };
    });

    setResults({
      d_abroad,
      c_total,
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
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
            <h2 className="text-xl font-bold mb-6 text-white">Your Inputs</h2>
            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label htmlFor="d_uae" className="text-sm font-medium text-gray-300">
                  Days in UAE
                </label>
                <input
                  type="number"
                  id="d_uae"
                  name="d_uae"
                  value={D_UAE}
                  disabled
                  aria-readonly="true"
                  className="w-full bg-gray-600 border-gray-500 rounded-md shadow-sm text-gray-300 cursor-not-allowed focus:ring-0 focus:border-gray-500"
                />
                <p className="text-xs text-gray-400 h-4 mt-1">Fixed – TRC safe zone</p>
              </div>
              <InputField id="c_uae" label="Monthly Cost of Living in UAE" value={inputs.c_uae} onChange={handleInputChange} description="in AED" min={0} error={errors.c_uae} />
              <InputField id="fx" label="AED to INR Exchange Rate" value={inputs.fx} onChange={handleInputChange} description="Current rate" step={0.01} min={0.01} error={errors.fx} />
              <InputField id="flights" label="Total Flight Cost" value={inputs.flights} onChange={handleInputChange} description="For 2 people, in INR" step={1000} symbol="₹" min={0} error={errors.flights}/>
              <InputField id="t_ind" label="Effective Indian Tax Rate" value={inputs.t_ind} onChange={handleInputChange} description="As a percentage" step={0.1} symbol="%" symbolPosition="after" min={0} max={100} error={errors.t_ind} />
              <InputField id="d_in" label="Days in India" value={inputs.d_in} onChange={handleInputChange} description="<=110 recommended for NRI status" min={0} max={DAYS_TOTAL - D_UAE} error={errors.d_in} />
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-8">
            {results ? (
              <>
                <SummaryCard results={results} d_uae={D_UAE} d_in={inputs.d_in} formatCurrency={formatCurrency} />
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
