"use client";

import Link from "next/link";

export default function FinalCta() {
  return (
    <section
      id="final-cta"
      style={{
        backgroundColor: "#061b31",
        padding: "96px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle accent gradient overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(83,58,253,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "560px", margin: "0 auto" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(139,123,255,0.9)",
            marginBottom: "20px",
          }}
        >
          Ready to start?
        </p>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 300,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            color: "#ffffff",
            marginBottom: "20px",
          }}
        >
          Your next client is waiting for a reason to say yes
        </h2>
        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.65)",
            marginBottom: "40px",
          }}
        >
          Run your first free audit in under two minutes. No credit card, no setup.
        </p>

        <Link
          href="/app"
          id="final-cta-button"
          style={{
            display: "inline-block",
            padding: "15px 32px",
            borderRadius: "9999px",
            backgroundColor: "#ffffff",
            color: "#061b31",
            fontWeight: 600,
            fontSize: "15px",
            textDecoration: "none",
            boxShadow:
              "0 4px 8px rgba(0,0,0,0.3)",
            transition: "background-color 0.15s, box-shadow 0.15s, transform 0.15s",
          }}
          onMouseOver={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "#f0f4ff";
            el.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)";
            el.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.backgroundColor = "#ffffff";
            el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
            el.style.transform = "translateY(0)";
          }}
        >
          Start your free audit →
        </Link>
      </div>
    </section>
  );
}
