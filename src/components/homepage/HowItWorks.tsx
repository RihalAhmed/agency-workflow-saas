"use client";

const STEPS = [
  {
    number: "01",
    title: "Audit the prospect's site",
    description:
      "Enter any URL and get a structured report covering design issues — CTA placement, visual hierarchy, trust signals — plus technical errors: speed, mobile responsiveness, broken links.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Get your personalised script",
    description:
      "Receive a ready-to-read sales script built from the audit findings plus proven outreach tactics — so your pitch is specific to this prospect, not a copy-paste template.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Share a branded report page",
    description:
      "Record your own pitch video (Loom-style — your face, your voice) and share a polished, branded report page that embeds the audit findings alongside your recording. The prospect gets evidence and a human.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e5edf5",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
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
            How it works
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "#061b31",
              margin: "0 auto",
              maxWidth: "520px",
            }}
          >
            Three steps from cold prospect to warm conversation
          </h2>
        </div>

        {/* Steps grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.number}
              style={{
                padding: "36px 32px",
                borderRadius: "14px",
                border: "1px solid #e5edf5",
                backgroundColor: "#ffffff",
                boxShadow:
                  "0 2px 5px -1px rgba(50,50,93,0.12), 0 1px 3px -1px rgba(0,0,0,0.08)",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow =
                  "0 6px 12px -2px rgba(50,50,93,0.2), 0 3px 7px -3px rgba(0,0,0,0.12)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow =
                  "0 2px 5px -1px rgba(50,50,93,0.12), 0 1px 3px -1px rgba(0,0,0,0.08)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Step icon + number row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(83,58,253,0.08)",
                    color: "#533afd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "#533afd",
                    opacity: 0.7,
                  }}
                >
                  STEP {step.number}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#061b31",
                  lineHeight: 1.25,
                  marginBottom: "12px",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: "#425466",
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
