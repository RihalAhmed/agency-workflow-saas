"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PrimitiveTestimonial } from "@/primitives";

export interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials?: Array<{
    name: string;
    quote: string;
    rating?: number;
    role?: string;
  }>;
}

export function Testimonials({
  title = "Testimonials",
  subtitle = "Real feedback from satisfied customers who trust our pest control results.",
  testimonials = [
    { name: "John D.", quote: "Excellent service!", rating: 5, role: "Homeowner" },
    { name: "Sarah M.", quote: "Very professional.", rating: 5, role: "Business Owner" },
    { name: "Mike T.", quote: "Highly recommended.", rating: 5 }
  ],
}: TestimonialsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="w-full bg-surface py-20 lg:py-28 overflow-hidden">
      <div className="max-w-[1728px] mx-auto px-4 sm:px-6 lg:px-[51px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-accent uppercase tracking-wider mb-2 font-body">
              {title}
            </h2>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-heading text-ink uppercase leading-tight">
              {subtitle}
            </p>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border-2 border-ink flex items-center justify-center text-ink hover:bg-ink hover:text-surface transition-colors"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full border-2 border-ink flex items-center justify-center text-ink hover:bg-ink hover:text-surface transition-colors"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t, idx) => (
            <div 
              key={idx} 
              className="snap-start shrink-0 w-[85vw] sm:w-[400px] lg:w-[460px]"
            >
              <PrimitiveTestimonial
                name={t.name}
                quote={t.quote}
                rating={t.rating}
                role={t.role}
                className="h-full bg-surfaceAlt shadow-md hover:shadow-xl transition-shadow border-border"
              />
            </div>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
}
