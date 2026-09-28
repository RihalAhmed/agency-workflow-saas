"use client";

import { useEffect, useRef } from "react";

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: [number, number, number];
}

const BLOBS: Blob[] = [
  { x: 0.25, y: 0.35, vx: 0.0003, vy: 0.0002, r: 0.55, color: [83, 58, 253] },
  { x: 0.7, y: 0.25, vx: -0.0002, vy: 0.00025, r: 0.45, color: [139, 123, 255] },
  { x: 0.5, y: 0.65, vx: 0.00015, vy: -0.0003, r: 0.5, color: [180, 165, 255] },
  { x: 0.15, y: 0.7, vx: 0.00025, vy: 0.0002, r: 0.38, color: [255, 255, 255] },
];

export default function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const blobsRef = useRef<Blob[]>(BLOBS.map((b) => ({ ...b })));

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return; // static CSS gradient shows instead

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      blobsRef.current.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0 || b.x > 1) b.vx *= -1;
        if (b.y < 0 || b.y > 1) b.vy *= -1;

        const cx = b.x * width;
        const cy = b.y * height;
        const r = b.r * Math.max(width, height);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},0.38)`);
        grad.addColorStop(1, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
