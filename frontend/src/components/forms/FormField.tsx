import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  helper?: string;
}

export function FormField({ label, children, helper }: FormFieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}