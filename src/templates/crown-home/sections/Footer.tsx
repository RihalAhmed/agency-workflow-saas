import React from "react";
import Image from "next/image";

export interface FooterProps {
  businessName: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  city?: string;
}

export function Footer({
  businessName,
  logoUrl = "/assets/logo.png",
  phone = "(904) 743-1132",
  email = "crownpestcontroljax@gmail.com",
  city = "Jacksonville, FL",
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-brand text-brand-fg border-t border-border mt-12 py-10 px-4 sm:px-8 font-body">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-36">
            <Image
              src={logoUrl}
              alt={`${businessName} logo`}
              fill
              className="object-contain object-left"
            />
          </div>
          <span className="text-xs text-brand-fg/70">
            © {currentYear} {businessName}. All rights reserved.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-brand-fg/85">
          {city && <span>{city}</span>}
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="hover:text-accent transition-colors"
            >
              {phone}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="hover:text-accent transition-colors"
            >
              {email}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
