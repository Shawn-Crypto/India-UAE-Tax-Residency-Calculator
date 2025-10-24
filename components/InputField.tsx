
import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description: string;
  step?: number;
  symbol?: string;
  symbolPosition?: 'before' | 'after';
  min?: number;
  max?: number;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange, description, step = 1, symbol, symbolPosition = 'before', min, max, error }) => {
  const errorClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        {symbol && symbolPosition === 'before' && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {symbol}
          </span>
        )}
        <input
          type="number"
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          step={step}
          min={min}
          max={max}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full bg-gray-700 border rounded-md shadow-sm text-white ${errorClasses} ${symbol && symbolPosition === 'before' ? 'pl-7' : ''} ${symbol && symbolPosition === 'after' ? 'pr-7' : ''}`}
        />
        {symbol && symbolPosition === 'after' && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            {symbol}
          </span>
        )}
      </div>
      <div className="h-4 mt-1">
        {error ? (
           <p id={`${id}-error`} className="text-xs text-red-400" role="alert">
             {error}
           </p>
        ) : (
           <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
};
