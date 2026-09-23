"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import {
  PrimitiveFormInput,
  PrimitiveFormSelect,
} from "@/primitives";

export interface QuoteFormProps {
  businessName: string;
  title?: string;
  services?: string[];
  submitButtonText?: string;
  consentText?: string;
}

export function QuoteForm({
  businessName,
  title = "REQUEST A FREE PEST CONTROL QUOTE",
  services = [
    "General Pest Inspection",
    "Termite Treatment & Prevention",
    "Rodent & Wildlife Control",
    "Mosquito & Yard Treatment",
    "Bed Bug Eradication",
    "Commercial Pest Management",
  ],
  submitButtonText = "Submit",
  consentText,
}: QuoteFormProps) {
  const [checked, setChecked] = useState(false);

  const legalText =
    consentText ||
    `I agree to receive communications from ${businessName} and understand my information will be handled in accordance with the Privacy Policy.`;

  return (
    <section id="quote" className="relative z-30 -mt-16 sm:-mt-20 px-3 sm:px-6">
      {/* Form Container: width 1180px in Figma (max-w-[1180px]) with visible soft border & shadow */}
      <div className="max-w-[1180px] w-full mx-auto bg-surface rounded-[20px] border-2 border-border shadow-[0_12px_40px_rgba(0,0,0,0.12)] relative">
        {/* Centered Top Hanging Title Banner Tab (Figma Rectangle 45: w: 511px, h: 60px, rounded-b-[20px]) */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[511px] h-[50px] sm:h-[60px] bg-brand text-brand-fg rounded-b-[20px] rounded-t-none flex items-center justify-center px-4 sm:px-6 shadow-sm">
            <h2 className="font-heading text-xs sm:text-base md:text-[18px] lg:text-[19px] uppercase tracking-wide text-brand-fg text-center leading-tight">
              {title}
            </h2>
          </div>
        </div>

        {/* Form Body */}
        <form
          action="#"
          method="POST"
          className="p-5 sm:p-8 lg:p-10 space-y-4"
        >
          {/* Row 1: 4 Inputs (Name, Phone, Email, Select) — using shared primitives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PrimitiveFormInput
              name="name"
              label="Name"
              placeholder="Name"
              type="text"
              required
            />
            <PrimitiveFormInput
              name="phone"
              label="Phone"
              placeholder="Phone"
              type="tel"
              required
            />
            <PrimitiveFormInput
              name="email"
              label="Email"
              placeholder="Email"
              type="email"
              required
            />
            <PrimitiveFormSelect
              name="service"
              label="Service"
              placeholder="Select service needed"
              options={services}
            />
          </div>

          {/* Row 2: Address, Message (spans 2), Submit Button */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <PrimitiveFormInput
              name="address"
              label="Address"
              placeholder="Address"
              type="text"
              className="sm:col-span-3"
            />
            <PrimitiveFormInput
              name="message"
              label="Message"
              placeholder="Message..."
              type="text"
              className="sm:col-span-6"
            />
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full h-[43px] bg-accent text-accent-fg font-body font-semibold rounded-[5px] px-6 text-sm uppercase tracking-wider hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center text-center"
              >
                {submitButtonText}
              </button>
            </div>
          </div>

          {/* Row 3: Custom Checkbox & Consent Text */}
          <div className="pt-2 flex items-center gap-2.5">
            {/* Custom styled checkbox */}
            <button
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => setChecked(!checked)}
              className={`w-4 h-4 rounded-[3px] border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                checked
                  ? "bg-accent border-accent text-accent-fg"
                  : "bg-surface-alt border-border hover:border-accent"
              }`}
            >
              {checked && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <input
              type="checkbox"
              id="quote-consent"
              name="consent"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              required
              className="sr-only"
            />
            <label
              htmlFor="quote-consent"
              onClick={() => setChecked(!checked)}
              className="text-xs sm:text-[13px] text-ink-muted leading-tight cursor-pointer select-none"
            >
              {legalText}
            </label>
          </div>
        </form>
      </div>
    </section>
  );
}
