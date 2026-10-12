/* SampleOutput — "What your prospect sees" section */

const AUDIT_ROWS = [
  { label: "Page Speed", score: 38, rating: "Poor", status: "poor" as const },
  { label: "Mobile Responsiveness", score: 71, rating: "Needs Work", status: "warn" as const },
  { label: "CTA Placement", score: 54, rating: "Needs Work", status: "warn" as const },
  { label: "Visual Hierarchy", score: 45, rating: "Poor", status: "poor" as const },
  { label: "Trust Signals", score: 82, rating: "Good", status: "good" as const },
  { label: "Broken Links", score: 95, rating: "Good", status: "good" as const },
  { label: "Traffic Indicators", score: 67, rating: "Needs Work", status: "warn" as const },
];

const STATUS = {
  good: { color: "#15be53", bg: "rgba(21,190,83,0.1)", dot: "#15be53" },
  warn: { color: "#9b6829", bg: "rgba(155,104,41,0.1)", dot: "#e8a042" },
  poor: { color: "#ea2261", bg: "rgba(234,34,97,0.1)", dot: "#ea2261" },
};

export default function SampleOutput() {
  return (
    <section
      id="sample-output"
      style={{
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e5edf5",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#533afd",
              marginBottom: "12px",
            }}
          >
            What your prospect sees
          </p>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              color: "#061b31",
              maxWidth: "520px",
              margin: "0 auto 16px",
            }}
          >
            A page that does the selling for you
          </h2>
          <p style={{ fontSize: "16px", color: "#425466", maxWidth: "460px", margin: "0 auto" }}>
            This is what you send. Evidence-backed, personal, and polished — not a cold email.
          </p>
        </div>

        {/* Demo report frame */}
        <div
          style={{
            borderRadius: "16px",
            border: "1px solid #e5edf5",
            overflow: "hidden",
            boxShadow:
              "0 6px 12px -2px rgba(50,50,93,0.18), 0 3px 7px -3px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Fake browser chrome */}
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "#f1f4f9",
              borderBottom: "1px solid #e5edf5",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ea2261" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#e8a042" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#15be53" }} />
            <div
              style={{
                flex: 1,
                marginLeft: "10px",
                backgroundColor: "#e5edf5",
                borderRadius: "6px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                gap: "6px",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7a8fa6" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span style={{ fontSize: "11px", color: "#7a8fa6" }}>prosflow.io/r/acme-roofing-sept26</span>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#533afd",
                backgroundColor: "rgba(83,58,253,0.08)",
                padding: "3px 8px",
                borderRadius: "4px",
              }}
            >
              DEMO
            </span>
          </div>

          {/* Report body */}
          <div style={{ padding: "32px 32px 40px" }}>
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "7px",
                      backgroundColor: "#533afd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 64 64" fill="none">
                      <path d="M26.13 30.8L15.95 30.2a3.5 3.5 0 0 1-2.04-1.02c-1.04-1.2-.11-3.06 1.48-2.94l5.89.43c1.79.13 2.99-1.8 2.08-3.34l-1.55-2.66a1.5 1.5 0 0 1 .14-1.73c.82-.96 2.34-.81 2.96.29L30.53 29c.85 1.53-.32 3.4-2.07 3.31L20 38z" fill="white"/>
                    </svg>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "15px", color: "#061b31" }}>ProsFlow</span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#061b31", margin: "0 0 4px" }}>
                  Website Audit — Acme Roofing
                </h3>
                <p style={{ fontSize: "13px", color: "#425466", margin: 0 }}>
                  acmeroofing.com · Prepared by Jordan M. · Sept 26, 2026
                </p>
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(234,34,97,0.08)",
                  border: "1px solid rgba(234,34,97,0.2)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#ea2261",
                }}
              >
                Overall Score: 59 / 100
              </div>
            </div>

            {/* Two-column layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "28px",
              }}
            >
              {/* Left: video embed */}
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#425466",
                    marginBottom: "10px",
                  }}
                >
                  Your personal pitch
                </p>
                <div
                  style={{
                    borderRadius: "10px",
                    backgroundColor: "#0f1728",
                    aspectRatio: "16/9",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Subtle gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(ellipse at 60% 40%, rgba(83,58,253,0.15) 0%, transparent 70%)",
                    }}
                  />
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(83,58,253,0.85)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <svg width="18" height="22" viewBox="0 0 18 22" fill="white">
                      <polygon points="0,0 18,11 0,22" />
                    </svg>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: 0 }}>
                      Jordan M. · 2:34
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "16px",
                      right: "16px",
                      height: "3px",
                      borderRadius: "2px",
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <div
                      style={{
                        width: "0%",
                        height: "100%",
                        backgroundColor: "#533afd",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#425466",
                    marginTop: "10px",
                    lineHeight: 1.5,
                  }}
                >
                  &quot;Hi — I spent 20 minutes on your site and found a few quick wins. Here&apos;s what I found and how I&apos;d approach it…&quot;
                </p>
              </div>

              {/* Right: audit table */}
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#425466",
                    marginBottom: "10px",
                  }}
                >
                  Audit findings
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {AUDIT_ROWS.map((row) => {
                    const s = STATUS[row.status];
                    return (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          backgroundColor: s.bg,
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: s.dot,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            flex: 1,
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#061b31",
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: s.color,
                          }}
                        >
                          {row.rating}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
