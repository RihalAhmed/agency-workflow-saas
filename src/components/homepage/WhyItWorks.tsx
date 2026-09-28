const POINTS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    heading: "Personalised, not templated",
    body: "Every report is built from that specific prospect's site. They can see you did the work.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    heading: "Evidence builds trust",
    body: "Scored findings give you credibility before you've said a word. You're the expert, not the salesperson.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.91 12a19.79 19.79 0 0 1-3.07-8.67 2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    heading: "Your face, your voice",
    body: "A real video from a real person beats an AI-written email every time. ProsFlow sets up the stage.",
  },
];

export default function WhyItWorks() {
  return (
    <section
      id="why-it-works"
      style={{
        backgroundColor: "#f9fbff",
        borderTop: "1px solid #e5edf5",
        padding: "80px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "48px",
          alignItems: "center",
        }}
      >
        {/* Left: headline + body */}
        <div>
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
            Why it converts
          </p>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 34px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              color: "#061b31",
              marginBottom: "18px",
            }}
          >
            Cold outreach fails because it looks like cold outreach
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.65,
              color: "#425466",
              maxWidth: "400px",
            }}
          >
            Generic pitch emails are filtered, ignored, or deleted. Personalised audit reports
            with a human video get read — because they prove you actually looked at the prospect&apos;s
            business, not just their name.
          </p>
        </div>

        {/* Right: supporting points */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {POINTS.map((pt, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                padding: "20px 22px",
                borderRadius: "12px",
                border: "1px solid #e5edf5",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(50,50,93,0.08)",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  backgroundColor: "rgba(83,58,253,0.08)",
                  color: "#533afd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {pt.icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#061b31",
                    marginBottom: "4px",
                  }}
                >
                  {pt.heading}
                </p>
                <p style={{ fontSize: "13px", color: "#425466", lineHeight: 1.55, margin: 0 }}>
                  {pt.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
