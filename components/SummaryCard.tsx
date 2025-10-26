
import React from 'react';
import { CalculationResults } from '../types';

interface SummaryCardProps {
  results: CalculationResults;
  d_uae: number;
  d_in: number;
  formatCurrency: (value: number) => string;
}

const SummaryItem: React.FC<{ label: string; value: string | number; valueClassName?: string }> = ({ label, value, valueClassName = '' }) => (
  <div className="flex justify-between py-2 border-b border-gray-700">
    <span className="text-gray-400">{label}</span>
    <span className={`font-semibold ${valueClassName}`}>{value}</span>
  </div>
);

export const SummaryCard: React.FC<SummaryCardProps> = ({ results, d_uae, d_in, formatCurrency }) => {
  const getStatusColor = (status: string) => {
    if (status.includes("Non-Resident") || status.includes("TRC Eligible")) return "text-green-400";
    if (status.includes("RNOR")) return "text-yellow-400";
    return "text-red-400";
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 text-white">Residency & Breakeven Summary</h2>
      <div className="space-y-2">
        <SummaryItem label="Days in UAE" value={d_uae} />
        <SummaryItem label="Days in India" value={d_in} />
        <SummaryItem label="Days Abroad" value={results.d_abroad} />
        <SummaryItem label="India Status" value={results.status_india} valueClassName={getStatusColor(results.status_india)} />
        <SummaryItem label="UAE Status" value={results.status_uae} valueClassName={getStatusColor(results.status_uae)} />
        <div className="pt-4 mt-4 border-t border-gray-700">
            <SummaryItem label="Incremental Cost of UAE Stay" value={formatCurrency(results.c_total)} valueClassName="text-indigo-400" />
            <SummaryItem label="First-Year Breakeven Income" value={formatCurrency(results.i_annual_breakeven)} valueClassName="text-teal-400" />
        </div>
      </div>
    </div>
  );
};
