"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────────────── */
/*  Types                                                              */
/* ─────────────────────────────────────────────────────────────────── */
type DropdownLink = {
  id: string;
  icon: string;
  label: string;
  description: string;
  href: string;
};

type NavItem = {
  id: string;
  label: string;
  href?: string;
  dropdownTitle?: string;
  dropdownItems?: DropdownLink[];
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Nav config                                                         */
/*  Solutions / Resources / Company → have dropdowns (fill items in)  */
/*  Pricing → plain link, no dropdown                                  */
/* ─────────────────────────────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  {
    id: "nav-solutions",
    label: "Solutions",
    dropdownTitle: "Solutions",
    dropdownItems: [
      /* ── Add solution links here ── */
    ],
  },
  {
    id: "nav-resources",
    label: "Resources",
    dropdownTitle: "Resources",
    dropdownItems: [
      /* ── Add resource links here ── */
    ],
  },
  { id: "nav-pricing", label: "Pricing", href: "#pricing" },
  {
    id: "nav-company",
    label: "Company",
    dropdownTitle: "Company",
    dropdownItems: [
      /* ── Add company links here ── */
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────── */
/*  DropdownPanel                                                      */
/* ─────────────────────────────────────────────────────────────────── */
function DropdownPanel({
  title,
  items,
  visible,
}: {
  title?: string;
  items: DropdownLink[];
  visible: boolean;
}) {
  return (
    <div
      role="menu"
      aria-hidden={!visible}
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        left: "50%",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(-6px)",
        minWidth: "300px",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "16px",
        border: "1px solid rgba(83,58,253,0.13)",
        boxShadow:
          "0 20px 60px -10px rgba(50,50,93,0.18), 0 6px 20px -6px rgba(0,0,0,0.1)",
        padding: "16px",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        zIndex: 200,
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          top: "-6px",
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: "12px",
          height: "12px",
          background: "#ffffff",
          border: "1px solid rgba(83,58,253,0.13)",
          borderBottom: "none",
          borderRight: "none",
          borderRadius: "2px 0 0 0",
        }}
      />

      {title && (
        <p
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#9bafc4",
            margin: "2px 8px 10px",
          }}
        >
          {title}
        </p>
      )}

      {items.length === 0 ? (
        /* Shimmer placeholder while items are pending */
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: "52px",
                borderRadius: "10px",
                background: "linear-gradient(90deg,#f0f4ff 0%,#e8edff 50%,#f0f4ff 100%)",
                backgroundSize: "200% 100%",
                animation: "pf-shimmer 1.6s infinite linear",
                opacity: 0.55,
              }}
            />
          ))}
          <p
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#9bafc4",
              margin: "6px 0 2px",
            }}
          >
            Coming soon…
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {items.map((item) => (
            <a
              key={item.id}
              id={item.id}
              href={item.href}
              role="menuitem"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(83,58,253,0.06)")
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "transparent")
              }
            >
              <span style={{ fontSize: "20px", lineHeight: 1, flexShrink: 0, marginTop: "2px" }}>
                {item.icon}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#061b31" }}>
                  {item.label}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7f95", lineHeight: 1.4 }}>
                  {item.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Header                                                             */
/* ─────────────────────────────────────────────────────────────────── */
export default function Header({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-pf-nav]")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const startClose = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 180);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <>
      <style>{`
        @keyframes pf-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 780px) {
          .pf-desktop-nav  { display: none !important; }
          .pf-mobile-btn   { display: flex !important; }
        }
      `}</style>

      <header
        id="site-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          transition: "background-color 0.2s, box-shadow 0.2s",
          boxShadow: scrolled ? "0 1px 4px rgba(50,50,93,0.07)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            padding: "0 24px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* ── Logo ── */}
          <Link href="/" id="header-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image
              src="/prosflow-wordmark.svg"
              alt="ProsFlow"
              width={160}
              height={40}
              style={{ height: "33px", width: "auto" }}
              priority
            />
          </Link>

          {/* ── Desktop nav ── */}
          <nav
            aria-label="Main navigation"
            className="pf-desktop-nav"
            data-pf-nav
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            {NAV_ITEMS.map((item) => {
              const hasDropdown = !!item.dropdownItems;
              const isOpen = openDropdown === item.id;

              return (
                <div
                  key={item.id}
                  style={{ position: "relative" }}
                  onMouseEnter={() => {
                    cancelClose();
                    if (hasDropdown) setOpenDropdown(item.id);
                  }}
                  onMouseLeave={() => {
                    if (hasDropdown) startClose();
                  }}
                >
                  {hasDropdown ? (
                    <button
                      id={item.id}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      onClick={() => setOpenDropdown(isOpen ? null : item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: isOpen ? "#533afd" : "#425466",
                        background: isOpen ? "rgba(83,58,253,0.07)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        transition: "color 0.15s, background 0.15s",
                      }}
                    >
                      {item.label}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          opacity: 0.55,
                        }}
                      >
                        <path
                          d="M2 4l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ) : (
                    <a
                      id={item.id}
                      href={item.href}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#425466",
                        textDecoration: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        transition: "color 0.15s, background 0.15s",
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "#061b31";
                        (e.currentTarget as HTMLElement).style.background = "rgba(6,27,49,0.05)";
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "#425466";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {item.label}
                    </a>
                  )}

                  {hasDropdown && (
                    <DropdownPanel
                      title={item.dropdownTitle}
                      items={item.dropdownItems ?? []}
                      visible={isOpen}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* ── CTA + mobile toggle ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isLoggedIn ? (
              <Link
                href="/audit"
                id="header-cta"
                style={{
                  display: "inline-block",
                  padding: "9px 22px",
                  borderRadius: "12px",
                  backgroundColor: "#533afd",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  transition: "background-color 0.15s",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#4434d4";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#533afd";
                }}
              >
                Go to Audit
              </Link>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link
                  href="/login"
                  style={{
                    display: "inline-block",
                    padding: "9px 16px",
                    color: "#425466",
                    fontWeight: 600,
                    fontSize: "14px",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#061b31";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#425466";
                  }}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  style={{
                    display: "inline-block",
                    padding: "9px 22px",
                    borderRadius: "12px",
                    backgroundColor: "#533afd",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "14px",
                    textDecoration: "none",
                    fontFamily: "Inter, sans-serif",
                    transition: "background-color 0.15s",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#4434d4";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#533afd";
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              aria-label="Toggle mobile menu"
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              className="pf-mobile-btn"
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "8px",
                color: "#425466",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            style={{
              borderTop: "1px solid #e5edf5",
              backgroundColor: "#ffffff",
              padding: "16px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href ?? "#"}
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#425466",
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: "10px",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
                {item.dropdownItems && (
                  <span style={{ opacity: 0.4, marginLeft: "4px" }}>›</span>
                )}
              </a>
            ))}
            <div style={{ marginTop: "8px" }}>
              {isLoggedIn ? (
                <Link
                  href="/audit"
                  style={{
                    display: "block",
                    padding: "11px 20px",
                    borderRadius: "12px",
                    backgroundColor: "#533afd",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "14px",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Go to Audit
                </Link>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Link
                    href="/login"
                    style={{
                      display: "block",
                      padding: "11px 20px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(6,27,49,0.05)",
                      color: "#061b31",
                      fontWeight: 600,
                      fontSize: "14px",
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    style={{
                      display: "block",
                      padding: "11px 20px",
                      borderRadius: "12px",
                      backgroundColor: "#533afd",
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "14px",
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
