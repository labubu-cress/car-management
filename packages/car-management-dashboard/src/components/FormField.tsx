import React from 'react';
import { formFieldStyles } from './FormField.css';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, required, error, children }) => {
  return (
    <div className={formFieldStyles.container}>
      <label className={formFieldStyles.label}>
        {label}
        {required && <span className={formFieldStyles.required}>*</span>}
      </label>
      <div className={formFieldStyles.inputContainer}>
        {children}
      </div>
      {error && <span className={formFieldStyles.error}>{error}</span>}
    </div>
  );
}; 