import React from 'react';

// Helper function to format number with commas
const formatNumberWithCommas = (value: string): string => {
  // First, try to parse as a number to handle decimal values correctly
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return '';
  }
  
  // For Korean won, we want to display whole numbers only
  const integerValue = Math.floor(numericValue);
  
  // Convert to string and add commas every 3 digits
  return integerValue.toLocaleString();
};

// Helper function to extract numbers only
const extractNumbers = (value: string): string => {
  return value.replace(/\D/g, '');
};

interface TextInputCompProps {
  name: string;
  value?: string;
  placeholder?: string;
  description?: string;
  onChange?: (value: string) => void;
  className?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'formatted-number';
}

export default function InputTextComp({ 
  name,
  value = '',
  placeholder = 'eg. 1st floor',
  description = 'Please write the name of the space where you want to install the tables.',
  onChange,
  className = '',
  type = 'text'
}: TextInputCompProps) {
  const handleInputChange = (inputValue: string) => {
    if (type === 'formatted-number') {
      // For formatted numbers, extract only numbers and pass raw numbers to onChange
      const numbersOnly = extractNumbers(inputValue);
      onChange?.(numbersOnly);
    } else {
      onChange?.(inputValue);
    }
  };

  const getDisplayValue = () => {
    if (type === 'formatted-number' && value) {
      return formatNumberWithCommas(value);
    }
    return value || '';
  };

  const getInputType = () => {
    if (type === 'formatted-number') return 'text';
    return type;
  };

  return (
    <div 
      className={`box-border flex flex-col gap-[0.2rem] items-start ${className}`}
      data-name="TextInput"
    >
      <label 
        className="FontStyleSubTitle text-white not-italic"
        htmlFor={name}
      >
        {name}
      </label>
      <input
        id={name}
        type={getInputType()}
        value={getDisplayValue()}
        placeholder={placeholder}
        onChange={(e) => handleInputChange(e.target.value)}
        className="FontStyleText box-border flex items-center px-[1rem] py-[0.5rem] rounded-[0.375rem] bg-[var(--light)] placeholder-gray-500 focus:outline-none transition-colors"
        style={{ 
          minHeight: '30px',
          width: '95%',
          color: 'var(--black)'
        }}
      />
      {description && (
        <div className="FontStyleDisclaimer text-[var(--light)] not-italic">
          {description}
        </div>
      )}
    </div>
  );
}