"use client";

import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

// Helper for displaying field validation error messages
export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-[11px] font-bold text-danger text-right leading-tight animate-in fade-in duration-200 mt-1">
      {error}
    </p>
  );
}

// Helper for displaying field labels
export function FieldLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-bold text-foreground/90 text-right select-none"
    >
      <span>{label}</span>
      {required && <span className="text-danger mr-1">*</span>}
    </label>
  );
}

// 1. InputField (Text, Email, Password, Date, Number)
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
  required?: boolean;
}

export function InputField({
  label,
  error,
  register,
  required,
  className,
  id,
  type = "text",
  ...props
}: InputFieldProps) {
  const fieldId = id || register.name;

  return (
    <div className="space-y-1.5 w-full">
      <FieldLabel htmlFor={fieldId} label={label} required={required} />
      <input
        id={fieldId}
        type={type}
        className={cn(
          "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:ring-1 focus:ring-primary",
          error ? "border-danger focus:border-danger focus:ring-danger" : "border-border focus:border-primary",
          className
        )}
        {...register}
        {...props}
      />
      <FieldError error={error} />
    </div>
  );
}

// 2. TextAreaField
interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
  required?: boolean;
}

export function TextAreaField({
  label,
  error,
  register,
  required,
  className,
  id,
  rows = 4,
  ...props
}: TextAreaFieldProps) {
  const fieldId = id || register.name;

  return (
    <div className="space-y-1.5 w-full">
      <FieldLabel htmlFor={fieldId} label={label} required={required} />
      <textarea
        id={fieldId}
        rows={rows}
        className={cn(
          "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:ring-1 focus:ring-primary custom-scrollbar",
          error ? "border-danger focus:border-danger focus:ring-danger" : "border-border focus:border-primary",
          className
        )}
        {...register}
        {...props}
      />
      <FieldError error={error} />
    </div>
  );
}

// 3. SelectField
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
  required?: boolean;
  options: { label: string; value: string | number }[];
}

export function SelectField({
  label,
  error,
  register,
  required,
  options,
  className,
  id,
  ...props
}: SelectFieldProps) {
  const fieldId = id || register.name;

  return (
    <div className="space-y-1.5 w-full">
      <FieldLabel htmlFor={fieldId} label={label} required={required} />
      <select
        id={fieldId}
        className={cn(
          "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:ring-1 focus:ring-primary cursor-pointer",
          error ? "border-danger focus:border-danger focus:ring-danger" : "border-border focus:border-primary",
          className
        )}
        {...register}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldError error={error} />
    </div>
  );
}

// 4. SwitchField (Toggle Switch)
interface SwitchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
  error?: string;
  register: UseFormRegisterReturn;
}

export function SwitchField({
  label,
  description,
  error,
  register,
  className,
  id,
  ...props
}: SwitchFieldProps) {
  const fieldId = id || register.name;

  return (
    <div className="space-y-1 w-full">
      <div className="flex items-center justify-between py-2 border border-transparent rounded-lg">
        <div className="space-y-0.5 text-right select-none">
          <label htmlFor={fieldId} className="text-xs font-bold text-foreground cursor-pointer">
            {label}
          </label>
          {description && (
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {/* Toggle Slide wrapper */}
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            id={fieldId}
            type="checkbox"
            className="sr-only peer"
            {...register}
            {...props}
          />
          <div
            className={cn(
              "w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary",
              className
            )}
          />
        </label>
      </div>
      <FieldError error={error} />
    </div>
  );
}
