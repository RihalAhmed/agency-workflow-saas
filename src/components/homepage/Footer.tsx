"use client";

import Link from "next/link";
import Image from "next/image";

const LINKS = {
  Product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer
      id="site-footer"
      style={{
        backgroundColor: "#f9fbff",
        borderTop: "1px solid #e5edf5",
        padding: "56px 24px 32px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr repeat(3, auto)",
            gap: "40px",
            marginBottom: "48px",
          }}
        >
          {/* Brand column */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", marginBottom: "12px" }}>
              <Image
                src="/prosflow-wordmark.svg"
                alt="ProsFlow"
                width={130}
                height={32}
                style={{ height: "22px", width: "auto" }}
              />
            </Link>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#7a8fa6",
                maxWidth: "220px",
              }}
            >
              Audit → Script → Report. The complete workflow for agency owners who win clients through personalised pitches.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#061b31",
                  marginBottom: "14px",
                }}
              >
                {section}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      style={{
                        fontSize: "13px",
                        color: "#7a8fa6",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#533afd")}
                      onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "#7a8fa6")}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: "1px solid #e5edf5",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "12px", color: "#7a8fa6", margin: 0 }}>
            © {new Date().getFullYear()} ProsFlow. All rights reserved.
          </p>
          <p style={{ fontSize: "12px", color: "#7a8fa6", margin: 0 }}>
            Built for agency owners who close.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          #site-footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
