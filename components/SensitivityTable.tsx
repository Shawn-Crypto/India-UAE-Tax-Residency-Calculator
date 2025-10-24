
import React from 'react';
import { SensitivityData } from '../types';

interface SensitivityTableProps {
  data: SensitivityData[];
  formatCurrency: (value: number) => string;
}

export const SensitivityTable: React.FC<SensitivityTableProps> = ({ data, formatCurrency }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8 lg:mt-0">
      <h2 className="text-xl font-bold mb-4 text-white">Sensitivity Analysis</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-600 text-sm text-gray-400">
            <tr>
              <th className="py-3 px-2 font-medium">Annual Income</th>
              <th className="py-3 px-2 font-medium text-right">Tax Saved</th>
              <th className="py-3 px-2 font-medium text-right">Net Gain/Loss</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-gray-700 last:border-b-0">
                <td className="py-3 px-2">{formatCurrency(row.income)}</td>
                <td className="py-3 px-2 text-right text-indigo-300">{formatCurrency(row.tax_saved)}</td>
                <td
                  className={`py-3 px-2 text-right font-semibold ${
                    row.net_gain >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(row.net_gain)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
