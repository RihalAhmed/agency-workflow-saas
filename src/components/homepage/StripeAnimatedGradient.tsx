"use client";

import { useEffect, useRef } from "react";

export default function StripeAnimatedGradient({
  colors = ["#533afd", "#2f6fed", "#0ea5b7", "#90e0ff"],
  className = "",
  style = {},
}: {
  colors?: string[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    let gradientInstance: any = null;
    
    // dynamically import whatamesh to avoid SSR issues
    if (typeof window !== "undefined" && canvasRef.current) {
      import("whatamesh").then((whatamesh) => {
        // Create a unique ID for this canvas if it doesn't have one
        const canvasId = "stripe-gradient-canvas-" + Math.random().toString(36).substring(7);
        canvasRef.current!.id = canvasId;
        
        gradientInstance = new whatamesh.Gradient();
        gradientInstance.initGradient("#" + canvasId);
      }).catch(err => {
        console.error("Failed to load whatamesh", err);
      });
    }
    
    return () => {
      // Basic cleanup if whatamesh exposes anything, otherwise just letting canvas unmount
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
        ["--gradient-color-1" as any]: colors[0],
        ["--gradient-color-2" as any]: colors[1],
        ["--gradient-color-3" as any]: colors[2],
        ["--gradient-color-4" as any]: colors[3],
      }}
      data-transition-in
    />
  );
}
