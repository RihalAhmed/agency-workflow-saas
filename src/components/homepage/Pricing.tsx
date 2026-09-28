import Link from "next/link";

const TIERS = [
  {
    id: "pricing-starter",
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For freelancers running their first audit campaigns.",
    features: [
      "Up to 30 audits per month",
      "AI-generated sales script",
      "Shareable report page",
      "Loom video embed",
      "Email support",
    ],
    cta: "Get started free",
    href: "/app",
    highlighted: false,
  },
  {
    id: "pricing-pro",
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "For agency owners running personalised outreach at scale.",
    features: [
      "Unlimited audits",
      "Custom branded report pages",
      "Priority script generation",
      "Team seats (up to 3)",
      "Priority email support",
      "Early access to new features",
    ],
    cta: "Start Pro free trial",
    href: "/app",
    highlighted: true,
    badge: "Most popular",
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        backgroundColor: "#ffffff",
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
            Pricing
          </p>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "#061b31",
              margin: "0 0 12px",
            }}
          >
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: "15px", color: "#425466" }}>
            Start free. No credit card required.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 420px))",
            gap: "24px",
            justifyContent: "center",
          }}
        >
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              id={tier.id}
              style={{
                position: "relative",
                padding: "36px 32px",
                borderRadius: "16px",
                border: tier.highlighted ? "2px solid #533afd" : "1px solid #e5edf5",
                backgroundColor: "#ffffff",
                boxShadow: tier.highlighted
                  ? "0 6px 12px -2px rgba(83,58,253,0.2), 0 3px 7px -3px rgba(0,0,0,0.1)"
                  : "0 2px 5px -1px rgba(50,50,93,0.1), 0 1px 3px -1px rgba(0,0,0,0.07)",
              }}
            >
              {tier.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "-13px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "4px 14px",
                    borderRadius: "9999px",
                    backgroundColor: "#533afd",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tier.badge}
                </div>
              )}

              <div style={{ marginBottom: "24px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: tier.highlighted ? "#533afd" : "#425466",
                    marginBottom: "8px",
                  }}
                >
                  {tier.name}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span
                    style={{
                      fontSize: "40px",
                      fontWeight: 300,
                      letterSpacing: "-0.03em",
                      color: "#061b31",
                    }}
                  >
                    {tier.price}
                  </span>
                  <span style={{ fontSize: "14px", color: "#425466" }}>{tier.period}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#425466", marginTop: "8px", lineHeight: 1.5 }}>
                  {tier.description}
                </p>
              </div>

              <Link
                href={tier.href}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: "9999px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                  marginBottom: "28px",
                  transition: "background-color 0.15s, box-shadow 0.15s",
                  backgroundColor: tier.highlighted ? "#533afd" : "transparent",
                  color: tier.highlighted ? "#ffffff" : "#061b31",
                  border: tier.highlighted ? "none" : "1px solid #e5edf5",
                  boxShadow: tier.highlighted
                    ? "0 2px 5px -1px rgba(50,50,93,0.25)"
                    : "none",
                }}
              >
                {tier.cta}
              </Link>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      color: "#425466",
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#15be53"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#7a8fa6",
            marginTop: "32px",
          }}
        >
          Placeholder pricing — final tiers TBD. All plans include a 14-day free trial.
        </p>
      </div>
    </section>
  );
}
