import { ReactNode, HTMLAttributes } from "react";

interface SopSheetProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function SopSheet({ children, className = "", noPadding = false, ...props }: SopSheetProps) {
  return (
    <div 
      className={`w-full max-w-4xl mx-auto bg-white min-h-[800px] shadow-sm ring-1 ring-black/5 mb-12 text-black ${noPadding ? '' : 'px-[40px] sm:px-[90px] md:px-[120px] py-8 sm:py-16'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
