import React from 'react';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'tel' | 'date';
  required?: boolean;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  required = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-primary text-sm font-normal tracking-[0.28px]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="text-foreground text-sm font-normal tracking-[1.12px] mt-[18px] bg-transparent border-none outline-none"
      />
      <div className="w-full shrink-0 h-[3px] border-accent border-solid border-[3px]" />
      {error && (
        <div className="flex items-stretch gap-1.5 text-[10px] text-destructive tracking-[0.2px] mt-2">
          <img
            src="https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/7e82001c7b762db54acd1c7624d5b01fde3938f5?placeholderIfAbsent=true"
            className="aspect-[1.07] object-contain w-4 bg-blend-normal shrink-0"
            alt="Error icon"
          />
          <span className="basis-auto">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
