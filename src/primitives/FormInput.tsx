"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export interface PrimitiveFormInputProps {
  /** Input name attribute */
  name: string;
  /** Accessible label (rendered as sr-only) */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Input type */
  type?: "text" | "tel" | "email" | "password" | "number";
  /** Whether the field is required */
  required?: boolean;
  /** Additional Tailwind classes on the outer wrapper */
  className?: string;
}

export interface PrimitiveFormSelectProps {
  /** Select name attribute */
  name: string;
  /** Accessible label (rendered as sr-only) */
  label: string;
  /** Placeholder option text */
  placeholder?: string;
  /** Options list */
  options: string[];
  /** Whether the field is required */
  required?: boolean;
  /** Additional Tailwind classes on the outer wrapper */
  className?: string;
}

const inputClasses =
  "w-full h-[43px] bg-surface-alt border border-border text-ink placeholder:text-ink-muted/70 rounded-[5px] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-colors";

/**
 * PrimitiveFormInput — styled text/email/tel input with sr-only label.
 * Consistent 43px height and 5px radius matching all designs.
 */
export function PrimitiveFormInput({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  className = "",
}: PrimitiveFormInputProps) {
  const id = `form-${name}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder || label}
        required={required}
        className={inputClasses}
      />
    </div>
  );
}

/**
 * PrimitiveFormSelect — styled dropdown select with custom chevron icon.
 * Consistent with PrimitiveFormInput dimensions.
 */
export function PrimitiveFormSelect({
  name,
  label,
  placeholder,
  options,
  required = false,
  className = "",
}: PrimitiveFormSelectProps) {
  const id = `form-${name}`;

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue=""
        required={required}
        className={`${inputClasses} appearance-none pr-10 cursor-pointer truncate`}
      >
        <option value="" disabled>
          {placeholder || `Select ${label.toLowerCase()}`}
        </option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-ink">
        <ChevronDown className="w-4 h-4 stroke-[2]" aria-hidden="true" />
      </div>
    </div>
  );
}
