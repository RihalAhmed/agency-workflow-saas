"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Phone, ChevronDown, Menu, X } from "lucide-react";
import { PrimitiveButton, PrimitiveBadge } from "@/primitives";

export interface HeaderProps {
  businessName: string;
  tagline?: string;
  email?: string;
  phone?: string;
  logoUrl: string;
  emergencyBadge?: string;
  ctaText?: string;
}

export function Header({
  businessName,
  tagline = "Family-Owned Since 1979. Better Because We Care.",
  email = "crownpestcontroljax@gmail.com",
  phone = "(904) 743-1132",
  logoUrl = "/assets/logo.png",
  emergencyBadge = "24/7 Emergency Support",
  ctaText = "GET A FREE QUOTE",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full relative z-40">
      {/* Top Bar: 3-column layout (Email Left, Tagline Center, Emergency+Phone Right) */}
      <div className="w-full bg-surface border-b border-border/30">
        <div className="w-full max-w-[1728px] mx-auto h-[48px] sm:h-[54px] lg:h-[60px] flex items-center justify-between px-4 sm:px-6 lg:px-[51px] relative">
          {/* Left Side: Email with larger, friendly Mail icon (hidden on small mobile to give room) */}
          <div className="hidden sm:flex items-center shrink-0">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 font-body font-medium text-xs sm:text-sm lg:text-[15px] text-ink hover:underline transition-colors"
              >
                <Mail
                  className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-ink shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>{email}</span>
              </a>
            )}
          </div>

          {/* Middle / Center: Top Header Tagline (desktop/tablet) */}
          <div className="hidden md:flex flex-1 items-center justify-center text-center px-4">
            <p className="font-body font-medium text-xs sm:text-sm lg:text-[15px] text-ink leading-tight">
              {tagline}
            </p>
          </div>

          {/* Right Side: Emergency Support + Phone Group (Figma Group 5 & 6) */}
          <div className="relative h-full flex items-center sm:flex-col sm:items-end sm:justify-end pb-0 sm:pb-1.5 ml-auto md:ml-0 shrink-0">
            {emergencyBadge && (
              <PrimitiveBadge
                variant="accent"
                className="hidden sm:inline-flex absolute top-0 right-0 min-w-[160px] lg:min-w-[195px] h-[22px] lg:h-[24px] rounded-b-[5px] rounded-t-none rounded-bl-[5px] rounded-br-[5px] shadow-xs text-[11px] lg:text-[12px] font-normal"
              >
                {emergencyBadge}
              </PrimitiveBadge>
            )}

            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2 font-body font-semibold text-xs sm:text-sm lg:text-[16px] text-ink hover:underline sm:mt-5"
              >
                <Phone
                  className="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] text-ink shrink-0"
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                <span>{phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar: Full-bleed brand background */}
      <div className="w-full bg-brand text-brand-fg shadow-md">
        <div className="w-full max-w-[1728px] mx-auto h-[75px] sm:h-[85px] lg:h-[110px] px-4 sm:px-6 lg:px-[51px] flex items-center justify-between relative">
          {/* Left: Brand Logo */}
          <div className="relative z-30 w-[160px] sm:w-[220px] lg:w-[260px] h-[55px] sm:h-[80px] lg:h-[90px] shrink-0 flex items-center">
            <Image
              src={logoUrl}
              alt={`${businessName} logo`}
              fill
              className="object-contain object-left"
              priority
            />
          </div>

          {/* Center: Desktop Navigation Links centered between Logo and CTA */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex flex-1 items-center justify-center gap-6 2xl:gap-8 font-nav text-[17px] 2xl:text-[20px] uppercase tracking-normal text-brand-fg px-4"
          >
            <a href="#home" className="hover:text-accent transition-colors">
              Home
            </a>
            <a
              href="#about"
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <span>About</span>
              <ChevronDown className="w-4 h-4 text-brand-fg stroke-[2.5]" aria-hidden="true" />
            </a>
            <a
              href="#services"
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <span>Pest Services</span>
              <ChevronDown className="w-4 h-4 text-brand-fg stroke-[2.5]" aria-hidden="true" />
            </a>
            <a
              href="#service-areas"
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <span>Service Areas</span>
              <ChevronDown className="w-4 h-4 text-brand-fg stroke-[2.5]" aria-hidden="true" />
            </a>
            <a href="#blog" className="hover:text-accent transition-colors">
              Blog
            </a>
            <a href="#contact" className="hover:text-accent transition-colors">
              Contact
            </a>
          </nav>

          {/* Right Desktop CTA Button — using PrimitiveButton */}
          <div className="hidden xl:block relative shrink-0">
            <PrimitiveButton
              href="#quote"
              variant="accent"
              className="text-sm sm:text-[16px] h-[43px] px-6 shadow-[4px_4px_0px_var(--surface)]"
            >
              {ctaText}
            </PrimitiveButton>
          </div>

          {/* Right Mobile Hamburger Menu Button (Matches User Screenshot: rounded button, bg-accent, shadow) */}
          <div className="xl:hidden flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
              className="w-[42px] h-[42px] rounded-[8px] bg-accent text-accent-fg shadow-[3px_3px_0px_var(--surface)] hover:translate-x-[1px] hover:translate-y-[1px] flex items-center justify-center cursor-pointer transition-all shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden w-full bg-brand border-t border-border/30 px-6 py-5 shadow-2xl space-y-4">
            <nav className="flex flex-col space-y-3 font-nav text-base uppercase text-brand-fg">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent transition-colors py-1"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent transition-colors py-1"
              >
                About
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent transition-colors py-1"
              >
                Pest Services
              </a>
              <a
                href="#service-areas"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent transition-colors py-1"
              >
                Service Areas
              </a>
              <a
                href="#blog"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent transition-colors py-1"
              >
                Blog
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent transition-colors py-1"
              >
                Contact
              </a>
            </nav>

            <div className="pt-3 border-t border-border/20 flex flex-col gap-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-xs text-brand-fg/80 hover:text-accent"
                >
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </a>
              )}
              {emergencyBadge && (
                <div className="inline-flex items-center text-xs text-accent font-medium">
                  {emergencyBadge}
                </div>
              )}
              <PrimitiveButton
                href="#quote"
                onClick={() => setMobileMenuOpen(false)}
                variant="accent"
                className="w-full h-[43px] text-sm shadow-[3px_3px_0px_var(--surface)]"
              >
                {ctaText}
              </PrimitiveButton>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
