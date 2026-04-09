import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  helper?: string;
  error?: string;
}

export function FormField({ label, children, helper, error }: FormFieldProps) {
  return (
    <label className={`form-field${error ? ' is-invalid' : ''}`}>
      <span>{label}</span>
      {children}
      {error ? <small className="field-error">{error}</small> : null}
      {helper && !error ? <small className="field-helper">{helper}</small> : null}
    </label>
  );
}