import React from "react";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export interface FooterProps {
  businessName: string;
  phone?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
}

export function Footer({
  businessName,
  phone = "800-466-9918",
  email = "info@nukingstreet.com",
  address = "9 Moody Rd., B11 Enfield, CT",
  logoUrl = "/assets/nukingstreet-logo.svg",
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-brand text-brandFg py-16 lg:py-24">
      <div className="max-w-[1728px] mx-auto px-4 sm:px-6 lg:px-[51px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Logo & Info */}
          <div className="flex flex-col gap-6">
            <div className="relative w-48 h-24">
              <Image
                src={logoUrl}
                alt={`${businessName} logo`}
                fill
                className="object-contain object-left brightness-0 invert"
              />
            </div>
            <p className="text-brandFg/80 font-body text-sm max-w-xs">
              Trusted Pest & Wildlife Experts serving the community with safe, effective, and responsible solutions.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-2xl uppercase tracking-wide text-accent mb-2">Quick Links</h3>
            <a href="#home" className="hover:text-accent font-body transition-colors">Home</a>
            <a href="#about" className="hover:text-accent font-body transition-colors">About Us</a>
            <a href="#services" className="hover:text-accent font-body transition-colors">Services</a>
            <a href="#testimonials" className="hover:text-accent font-body transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-accent font-body transition-colors">Contact</a>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-2xl uppercase tracking-wide text-accent mb-2">Services</h3>
            <span className="font-body text-brandFg/90">General Pest Control</span>
            <span className="font-body text-brandFg/90">Wildlife Removal</span>
            <span className="font-body text-brandFg/90">Rodent Control</span>
            <span className="font-body text-brandFg/90">Commercial Services</span>
          </div>

          {/* Column 4: Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-2xl uppercase tracking-wide text-accent mb-2">Contact Us</h3>
            
            {phone && (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex items-start gap-3 hover:text-accent transition-colors">
                <Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="font-body">{phone}</span>
              </a>
            )}
            
            {email && (
              <a href={`mailto:${email}`} className="flex items-start gap-3 hover:text-accent transition-colors">
                <Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="font-body">{email}</span>
              </a>
            )}

            {address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="font-body text-brandFg/90">{address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-brandFg/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-body text-brandFg/60">
          <p>© {currentYear} {businessName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-brandFg transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brandFg transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
