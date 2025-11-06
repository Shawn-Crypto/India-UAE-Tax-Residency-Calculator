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
          <section className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg h-fit" aria-label="Calculator Inputs">
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
          </section>

          <section className="lg:col-span-3 flex flex-col gap-8" aria-label="Results and Analysis">
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
          </section>
        </main>

        {/* FAQ Section */}
        <section className="mt-16 max-w-5xl mx-auto" aria-label="Frequently Asked Questions">
          <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
            Frequently Asked Questions
          </h2>

          <div className="bg-gray-800 rounded-lg shadow-lg divide-y divide-gray-700">
            <details className="p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>How many days do I need to stay in UAE for tax residency?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                You need to spend at least <strong>183 days</strong> in the UAE during a calendar year to qualify for UAE tax residency and obtain a Tax Residency Certificate (TRC). However, <strong>190+ days</strong> is recommended for a safe zone to ensure compliance and avoid any complications with tax authorities.
              </p>
            </details>

            <details className="p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>What is NRI status in India?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                <strong>Non-Resident Indian (NRI)</strong> status is achieved when you spend <strong>less than 111 days</strong> in India during a financial year. NRIs are only taxed on income earned or received in India, not on global income, providing significant tax advantages for those living abroad.
              </p>
            </details>

            <details className="p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>What is RNOR status?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                <strong>Resident but Not Ordinarily Resident (RNOR)</strong> status applies when you spend <strong>between 111 and 181 days</strong> in India during a financial year. RNOR status provides partial tax relief compared to full residency, where only certain foreign income (like income from business controlled from India or professional services in India) is taxable.
              </p>
            </details>

            <details className="p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>Can I be tax resident in both UAE and India?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                While it's theoretically possible to meet residency criteria in both countries, the <strong>India-UAE Double Tax Avoidance Agreement (DTAA)</strong> provides tie-breaker rules to determine primary tax residency and avoid double taxation. The DTAA considers factors like permanent home, center of vital interests, and habitual abode to resolve dual residency situations.
              </p>
            </details>

            <details className="p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>What is a Tax Residency Certificate (TRC)?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                A <strong>Tax Residency Certificate (TRC)</strong> is an official document issued by the UAE tax authorities proving that you are a tax resident of the UAE. This certificate is essential for claiming benefits under the India-UAE DTAA and avoiding double taxation on your income. You'll need this when dealing with Indian tax authorities or financial institutions.
              </p>
            </details>

            <details className="p-6 group">
              <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                <span>How does the 183-day rule work?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                The <strong>183-day rule</strong> is a threshold used by many countries, including UAE and India, to determine tax residency. If you spend 183 or more days in a country during a tax year (calendar year for UAE, financial year for India), you're generally considered a tax resident of that country. This rule is crucial for determining which country has the primary right to tax your income.
              </p>
            </details>
          </div>
        </section>

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