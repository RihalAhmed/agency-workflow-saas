"use client";

import { useState } from "react";
import Image from "next/image";
import HeroWaveLoader from "./HeroWaveLoader";

const TABS = [
  { id: "tab-site-audit",        label: "Site Audit",        color: "#533afd" },
  { id: "tab-website-demo",      label: "Website Demo",      color: "#2f6fed" },
  { id: "tab-script-generation", label: "Script Generation", color: "#0ea5b7" },
];

export default function Hero() {
  const [activeTab, setActiveTab] = useState(0);
  const [url, setUrl] = useState("");

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        backgroundColor: "#ffffff",
        paddingTop: "90px",
        paddingBottom: "0",
        minHeight: "520px",
      }}
    >
      {/* 3D HERO WAVE RIBBON */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          width: "45%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <HeroWaveLoader />
      </div>

      {/* CONTENT */}
      <div
        id="hero-content"
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1440px",
          margin: "0px auto",
          padding: "40px 300px 0px 300px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        {/* H1 */}
        <h1
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(32px, 3.3vw, 48px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "#000000",
            margin: "0 0 15px",
            maxWidth: "820px",
          }}
        >
          Turn any prospect&apos;s website into a client-winning pitch
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#000000",
            fontWeight: 400,
            maxWidth: "638px",
            margin: "0 0 68px", 
          }}
        >
          Audit their site, generate a personalised sales script, record your
          pitch and share a branded report page that closes.
        </p>

        {/* PILL + LABEL + INPUT CLUSTER */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "746px" }}>
          {/* "START WITH" label */}
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#000000",
              margin: "0 0 6px",
            }}
          >
            Start With
          </p>

          {/* Pills row */}
          <div
            style={{
              position: "relative",
              display: "inline-flex",
              margin: "0", /* No gap from input box */
              paddingTop: "2px",
            }}
          >
            {/* Absolute check badge */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-3px",
                top: "-7px",
                width: "20px",
                height: "20px",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9.5" fill="white" stroke="black" strokeWidth="1" />
                <path
                  d="M5.5 10.5l3.5 3.5 5.5-6"
                  stroke="black"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                id={tab.id}
                onClick={() => setActiveTab(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 12px",
                  height: "20px",
                  width: "136px",
                  backgroundColor: tab.color,
                  color: "#ffffff",
                  fontSize: "10.5px",
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  border: "none",
                  cursor: "pointer",
                  borderRadius:
                    i === 0
                      ? "10px 0px 0px 0px"
                      : i === TABS.length - 1
                      ? "0px 10px 0px 0px"
                      : "0px",
                  opacity: activeTab === i ? 1 : 0.75,
                  transition: "opacity 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "57px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: "20px",
              padding: "0 8px 0 8px",
              boxSizing: "border-box",
            }}
          >
            {/* Avatar stack */}
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0, gap: "0" }}>
              {[
                "/hero-avatar-3.png",
                "/hero-avatar-4.png",
                "/hero-avatar-1.png",
              ].map((src, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    width: "39px",
                    height: "36px",
                    borderRadius: "12px",
                    border: "2px solid #ffffff",
                    marginLeft: i === 0 ? 0 : "-10px",
                    backgroundColor: "#533afd",
                    overflow: "hidden",
                    flexShrink: 0,
                    zIndex: 3 - i,
                  }}
                >
                  <Image src={src} alt="" fill sizes="39px" style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>

            {/* Vertical line */}
            <div
              style={{
                width: "1px",
                height: "21px",
                backgroundColor: "rgba(0,0,0,0.15)",
                flexShrink: 0,
                margin: "0 14px",
              }}
            />

            {/* Placeholder text */}
            <input
              type="url"
              id="hero-url-input"
              placeholder="Prospect website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "15px",
                fontWeight: 400,
                fontFamily: "Inter, sans-serif",
                color: "#000000",
                backgroundColor: "transparent",
                minWidth: 0,
              }}
            />

            {/* Search button */}
            <button
              id="hero-search-btn"
              aria-label="Search"
              style={{
                width: "70px",
                height: "40px",
                borderRadius: "15px",
                backgroundColor: "#533afd",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background-color 0.15s",
              }}
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "#4434d4")
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "#533afd")
              }
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="7" cy="7" r="4.5" />
                <line x1="10.5" y1="10.5" x2="14" y2="14" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* App mockup — centred below content */}
      <div
        id="hero-mockup"
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "36px 20px 0 20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "878px",
            aspectRatio: "878 / 431",
            borderRadius: "14px 14px 0 0",
            overflow: "hidden",
          }}
        >
          <Image
            src="/hero-app-mockup.png"
            alt="Prosflow app dashboard"
            fill
            sizes="878px"
            style={{ objectFit: "cover", objectPosition: "top left" }}
            priority
          />
        </div>
      </div>

      <style>{`
        #hero-url-input::placeholder { color: rgba(0,0,0,0.4); }
        @media (max-width: 1100px) {
          #hero-content { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </section>
  );
}
