"use client";

/* Feature bento grid — three cards showing real product surfaces */

function AuditMockup() {
  const rows = [
    { label: "Page Speed", score: 38, status: "poor" as const },
    { label: "Mobile Responsiveness", score: 71, status: "warn" as const },
    { label: "CTA Placement", score: 54, status: "warn" as const },
    { label: "Trust Signals", score: 82, status: "good" as const },
    { label: "Visual Hierarchy", score: 45, status: "poor" as const },
    { label: "Broken Links", score: 95, status: "good" as const },
  ];

  const statusColors = {
    good: { bg: "rgba(21,190,83,0.1)", text: "#15be53", bar: "#15be53" },
    warn: { bg: "rgba(155,104,41,0.1)", text: "#9b6829", bar: "#e8a042" },
    poor: { bg: "rgba(234,34,97,0.1)", text: "#ea2261", bar: "#ea2261" },
  };

  const statusLabels = { good: "Good", warn: "Needs work", poor: "Poor" };

  return (
    <div style={{ fontSize: "12px", fontFamily: "inherit" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#425466",
          fontWeight: 600,
          marginBottom: "10px",
          padding: "0 4px",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        <span>Check</span>
        <span>Score</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        {rows.map((row) => {
          const c = statusColors[row.status];
          return (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                borderRadius: "8px",
                backgroundColor: c.bg,
              }}
            >
              <span
                style={{
                  flex: 1,
                  color: "#061b31",
                  fontWeight: 500,
                  fontSize: "12px",
                }}
              >
                {row.label}
              </span>
              <div
                style={{
                  width: "60px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(0,0,0,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${row.score}%`,
                    height: "100%",
                    backgroundColor: c.bar,
                    borderRadius: "2px",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: c.text,
                  minWidth: "58px",
                  textAlign: "right",
                }}
              >
                {statusLabels[row.status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScriptMockup() {
  const points = [
    "Hey [Name], I took a look at your site — there are three quick wins that could lift your conversion rate.",
    "Your main CTA is below the fold on mobile. 63% of your visitors are on phones.",
    "I spotted 4 broken internal links — Google penalises this and visitors hit dead ends.",
    "You're missing trust signals above the fold: no review count, no badge, no guarantee.",
    "I put together a short video showing exactly how to fix each of these. No pitch, just value.",
  ];

  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#533afd",
          marginBottom: "12px",
        }}
      >
        Talking points · acmeroofing.com
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {points.map((point, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
          >
            <span
              style={{
                flexShrink: 0,
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "rgba(83,58,253,0.1)",
                color: "#533afd",
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "1px",
              }}
            >
              {i + 1}
            </span>
            <p
              style={{
                fontSize: "12px",
                lineHeight: 1.55,
                color: "#425466",
                margin: 0,
              }}
            >
              {point}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportMockup() {
  return (
    <div>
      <div
        style={{
          borderRadius: "8px",
          border: "1px solid #e5edf5",
          overflow: "hidden",
          backgroundColor: "#f9fbff",
        }}
      >
        {/* Fake browser bar */}
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#f1f4f9",
            borderBottom: "1px solid #e5edf5",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ea2261" }} />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#e8a042" }} />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#15be53" }} />
          <div
            style={{
              flex: 1,
              marginLeft: "8px",
              backgroundColor: "#e5edf5",
              borderRadius: "4px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              paddingLeft: "8px",
            }}
          >
            <span style={{ fontSize: "9px", color: "#7a8fa6" }}>prosflow.io/r/acme-roofing</span>
          </div>
        </div>
        {/* Report preview body */}
        <div style={{ padding: "12px" }}>
          <div style={{ marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#061b31" }}>
              Website Audit — Acme Roofing
            </span>
          </div>
          {/* Video placeholder */}
          <div
            style={{
              borderRadius: "6px",
              backgroundColor: "#1a1a2e",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "rgba(83,58,253,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="8" height="10" viewBox="0 0 8 10" fill="white">
                <polygon points="0,0 8,5 0,10" />
              </svg>
            </div>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", marginLeft: "8px" }}>
              2:34 · Your personal pitch
            </span>
          </div>
          {/* Mini audit rows */}
          {[
            { label: "Page Speed", color: "#ea2261" },
            { label: "Trust Signals", color: "#15be53" },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
                borderBottom: "1px solid #e5edf5",
              }}
            >
              <span style={{ fontSize: "10px", color: "#425466" }}>{r.label}</span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: r.color,
                }}
              >
                ●
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CARDS = [
  {
    id: "bento-audit",
    label: "Audit Report",
    description: "Structured findings across design, trust, and technical health — each scored and colour-coded.",
    mockup: <AuditMockup />,
    wide: true,
  },
  {
    id: "bento-script",
    label: "Sales Script",
    description: "Talking points generated from the audit, ready to read while you record.",
    mockup: <ScriptMockup />,
    wide: false,
  },
  {
    id: "bento-report",
    label: "Shareable Report Page",
    description: "A branded, hosted page your prospect can view with your video and the full audit.",
    mockup: <ReportMockup />,
    wide: false,
  },
];

export default function FeatureGrid() {
  return (
    <section
      id="features"
      style={{
        backgroundColor: "#f9fbff",
        borderTop: "1px solid #e5edf5",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
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
            The product
          </p>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "#061b31",
              margin: 0,
            }}
          >
            Everything in one workflow
          </h2>
        </div>

        {/* Bento grid: large card left, two smaller right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gridTemplateRows: "auto",
            gap: "20px",
          }}
        >
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              id={card.id}
              style={{
                gridColumn: card.wide ? "1 / -1" : undefined,
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid #e5edf5",
                backgroundColor: "#ffffff",
                boxShadow:
                  "0 2px 5px -1px rgba(50,50,93,0.12), 0 1px 3px -1px rgba(0,0,0,0.07)",
                display: "flex",
                flexDirection: card.wide ? "row" : "column",
                gap: "28px",
                alignItems: card.wide ? "flex-start" : "stretch",
              }}
            >
              {/* Text part */}
              <div style={{ flex: card.wide ? "0 0 260px" : undefined }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#533afd",
                    marginBottom: "10px",
                  }}
                >
                  {card.label}
                </span>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "#425466",
                    margin: 0,
                  }}
                >
                  {card.description}
                </p>
              </div>

              {/* Mockup part */}
              <div style={{ flex: 1 }}>{card.mockup}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
