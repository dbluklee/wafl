import React from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownInputCompProps {
  name: string;
  value?: string;
  options: DropdownOption[];
  placeholder?: string;
  description?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function InputDropdownComp({ 
  name,
  value = '',
  options = [],
  placeholder = 'Please select an option',
  description = 'Please select an option from the dropdown.',
  onChange,
  className = ''
}: DropdownInputCompProps) {
  return (
    <div 
      className={`box-border flex flex-col gap-[0.2rem] items-start ${className}`}
      data-name="DropdownInput"
    >
      <label 
        className="FontStyleSubTitle text-white not-italic"
        htmlFor={name}
      >
        {name}
      </label>
      <select
        id={name}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="FontStyleText box-border flex items-center px-[1rem] py-[0.5rem] rounded-[0.375rem] bg-[var(--light)] focus:outline-none transition-colors cursor-pointer"
        style={{ 
          minHeight: '30px',
          width: '95%',
          color: value ? 'var(--black)' : '#6b7280'
        }}
      >
        <option value="" disabled style={{ color: '#6b7280' }}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            style={{ color: 'var(--black)' }}
          >
            {option.label}
          </option>
        ))}
      </select>
      {description && (
        <div className="FontStyleDisclaimer text-[var(--light)] not-italic">
          {description}
        </div>
      )}
    </div>
  );
}