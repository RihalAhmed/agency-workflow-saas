"use client";

import React, { useState } from "react";
import { PrimitiveFormInput, PrimitiveButton } from "@/primitives";
import { Send } from "lucide-react";

export interface QuoteFormProps {
  title?: string;
  submitButtonText?: string;
  disclaimerText?: string;
}

export function QuoteForm({
  title = "Get Your Free Estimate",
  submitButtonText = "Submit",
  disclaimerText = 'By submitting your information, you agree to receive notifications and promotional SMS from Nukingstreet Pest & Wildlife Control. You can reply "STOP" at any time to unsubscribe. I agree to the Privacy Policy and Terms & Conditions.',
}: QuoteFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    zipCode: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you! We will contact you shortly.");
  };

  return (
    <section className="w-full bg-surface py-20 lg:py-28 relative overflow-hidden" id="quote">
      <div className="max-w-[1728px] mx-auto px-4 sm:px-6 lg:px-[51px]">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-surfaceAlt p-8 sm:p-12 lg:p-16 rounded-[40px] shadow-2xl border border-border/50">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading uppercase text-ink tracking-tight mb-4">
                {title}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PrimitiveFormInput
                  name="name"
                  label="Name"
                  type="text"
                  placeholder="Name"
                  required
                  className="bg-surface border-border/30 rounded-xl h-14"
                />
                <PrimitiveFormInput
                  name="zipCode"
                  label="Zip Code"
                  type="text"
                  placeholder="Zip Code"
                  required
                  className="bg-surface border-border/30 rounded-xl h-14"
                />
                <PrimitiveFormInput
                  name="phone"
                  label="Phone"
                  type="tel"
                  placeholder="Phone"
                  required
                  className="bg-surface border-border/30 rounded-xl h-14"
                />
                <PrimitiveFormInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                  required
                  className="bg-surface border-border/30 rounded-xl h-14"
                />
              </div>
              
              <div className="mt-6">
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full bg-surface border border-border/30 rounded-xl h-14 px-5 font-body text-inkMuted outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  required
                >
                  <option value="" disabled>Choose Service</option>
                  <option value="pest-control">General Pest Control</option>
                  <option value="wildlife">Wildlife Removal</option>
                  <option value="commercial">Commercial Services</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mt-6">
                <textarea
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-surface border border-border/30 rounded-xl p-5 min-h-[120px] font-body text-ink outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-y"
                  required
                />
              </div>

              <div className="mt-8 flex justify-center">
                <PrimitiveButton
                  type="submit"
                  variant="brand"
                  className="w-full sm:w-auto min-w-[240px] h-16 text-xl font-heading uppercase tracking-wide shadow-[4px_4px_0px_var(--accent)] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  {submitButtonText}
                </PrimitiveButton>
              </div>

              {disclaimerText && (
                <p className="mt-6 text-xs text-center text-inkMuted max-w-2xl mx-auto leading-relaxed">
                  {disclaimerText}
                </p>
              )}
            </form>
          </div>
          
        </div>
      </div>
    </section>
  );
}
