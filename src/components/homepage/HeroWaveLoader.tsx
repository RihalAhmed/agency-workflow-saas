"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";

const HeroWave = dynamic(() => import("./HeroWave"), { ssr: false });

export default function HeroWaveLoader() {
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;
    setCanAnimate(!reducedMotion && !isMobile);
  }, []);

  if (!canAnimate) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Image
          src="/hero-blob.png"
          alt=""
          aria-hidden="true"
          fill
          style={{ objectFit: "contain", objectPosition: "right center" }}
        />
      </div>
    );
  }

  return <HeroWave />;
}
