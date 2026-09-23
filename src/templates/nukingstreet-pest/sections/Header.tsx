"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Phone, ChevronDown, Menu, X } from "lucide-react";
import { PrimitiveButton } from "@/primitives";

export interface HeaderProps {
  businessName: string;
  tagline?: string;
  email?: string;
  phone?: string;
  logoUrl: string;
  businessReg?: string;
}

export function Header({
  businessName,
  tagline = "Trusted Pest & Wildlife Experts",
  email = "info@nukingstreet.com",
  phone = "800-466-9918",
  logoUrl = "/assets/nukingstreet-logo.svg", // Using the one we just exported, but generator will pass dynamic logoUrl
  businessReg = "B-2562",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full relative z-40 bg-surface">
      {/* Top Bar */}
      <div className="w-full bg-surface border-b border-border/20">
        <div className="w-full max-w-[1728px] mx-auto h-[48px] sm:h-[52px] flex items-center justify-between px-4 sm:px-6 lg:px-[51px]">
          {/* Left Side: Tagline */}
          <div className="hidden md:flex items-center text-sm font-medium text-ink font-body">
            {tagline}
          </div>

          {/* Middle: Business Reg */}
          {businessReg && (
            <div className="hidden lg:flex items-center justify-center text-sm font-semibold text-accent font-body uppercase tracking-wider">
              #Business Reg. {businessReg}
            </div>
          )}

          {/* Right Side: Phone & Email */}
          <div className="flex items-center justify-end gap-6 ml-auto lg:ml-0">
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2 text-sm font-bold text-ink hover:text-accent font-body"
              >
                <Phone className="w-4 h-4" />
                <span>Phone: {phone}</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-ink/80 hover:text-accent font-body"
              >
                <Mail className="w-4 h-4" />
                <span>Email: {email}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full bg-surface">
        <div className="w-full max-w-[1728px] mx-auto h-[80px] sm:h-[90px] lg:h-[110px] px-4 sm:px-6 lg:px-[51px] flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="relative z-30 w-[180px] sm:w-[220px] lg:w-[274px] h-[55px] sm:h-[80px] lg:h-[147px] shrink-0 flex items-center">
            <Image
              src={logoUrl}
              alt={`${businessName} logo`}
              fill
              className="object-contain object-left"
              priority
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center gap-8 font-heading text-[18px] uppercase text-ink"
          >
            <a href="#home" className="hover:text-accent">
              Home
            </a>
            <a href="#about" className="hover:text-accent">
              About
            </a>
            <a href="#pest-control" className="hover:text-accent">
              Pest Control
            </a>
            <a href="#wildlife" className="hover:text-accent">
              Wildlife
            </a>
            <a href="#commercial" className="hover:text-accent">
              Commercial
            </a>
            <a href="#blog" className="hover:text-accent">
              Blog
            </a>
            <a href="#contact" className="hover:text-accent">
              Contact
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="xl:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-[42px] h-[42px] bg-brand text-brandFg flex items-center justify-center rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
