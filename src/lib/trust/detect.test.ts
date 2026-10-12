import { describe, expect, test } from "vitest";
import { detectTrust } from "./detect";
import { TrustSignalsSchema } from "./schemas";
import type { RenderedTrustPage } from "./types";
import { matchTownOrState } from "./data/us-states";

describe("US States Matcher", () => {
  test("matches city and 2-letter state code", () => {
    expect(matchTownOrState("Best Roofing in Dallas, TX").matched).toBe(true);
    expect(matchTownOrState("Best Roofing in Dallas, TX").token).toBe("Dallas, TX");
  });

  test("matches state full name", () => {
    expect(matchTownOrState("Top Rated HVAC in Texas").matched).toBe(true);
    expect(matchTownOrState("Top Rated HVAC in Texas").token).toBe("Texas");
  });

  test("does not match non-state uppercase words", () => {
    expect(matchTownOrState("Call NOW for Special OFFERS").matched).toBe(false);
  });
});

describe("detectTrust", () => {
  test("analyzes full prospect page and generates valid TrustSignals", async () => {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <header>
            <a href="/" class="logo"><img src="/logo.png" alt="Apex Roofing Logo" /></a>
            <nav>
              <a href="/">Home</a>
              <a href="/services">Services</a>
              <a href="/contact">Contact</a>
            </nav>
            <a href="tel:2145550199" class="phone">214-555-0199</a>
            <a href="/quote" class="btn">Get Free Quote</a>
          </header>

          <section id="hero">
            <h1>Apex Roofing Contractors in Dallas, TX</h1>
            <p>100% Satisfaction Guarantee on all residential roof installations.</p>
            <div class="badges">
              <span>Licensed and Insured</span>
              <span>BBB Accredited</span>
              <img src="/google-review.png" alt="Google 5 star reviews" />
            </div>
            <img src="/fleet-truck.jpg" alt="Our branded work truck" />
            <form id="quote-form">
              <input type="text" name="name" />
              <input type="tel" name="phone" />
              <button type="submit">Claim Estimate</button>
            </form>
          </section>

          <section id="reviews">
            <h2>Customer Reviews & Testimonials</h2>
            <div class="rating">5.0 Stars (150+ Google Reviews)</div>
            <div class="cards">
              <div class="card"><p>Great job!</p><img src="/google-logo.svg" alt="Google" /></div>
              <div class="card"><p>Fast and reliable.</p><img src="/google-logo.svg" alt="Google" /></div>
              <div class="card"><p>Highly recommend.</p><img src="/google-logo.svg" alt="Google" /></div>
            </div>
            <a href="https://google.com/maps/place/apex" target="_blank">View on Google Maps</a>
          </section>

          <section id="about">
            <h2>About Our Family Business</h2>
            <p>We started Apex Roofing in 2004. Our family has lived in the Dallas metroplex for 3 generations. When you call us, I personally ensure our team treats your home like our own.</p>
            <img src="/founder-signature.png" alt="Founder Signature" />
            <img src="/logo-small.png" class="logo" alt="Apex Logo" />
            <a href="/contact" class="btn">Contact Our Team</a>
          </section>
        </body>
      </html>
    `;

    const rendered: RenderedTrustPage = {
      html: fullHtml,
      layout: {
        h1: { x: 50, y: 150, w: 800, h: 60 },
        firstForm: { x: 900, y: 200, w: 400, h: 450 },
        images: [
          { src: "/fleet-truck.jpg", alt: "Our branded work truck", isBackground: false, bbox: { x: 50, y: 350, w: 400, h: 300 }, sectionGuess: "hero" },
          { src: "/owner-photo.jpg", alt: "Founder photo", isBackground: false, bbox: { x: 50, y: 1900, w: 300, h: 300 }, sectionGuess: "about" },
        ],
        sections: [
          { selectorPath: "header", bbox: { x: 0, y: 0, w: 1440, h: 80 } },
          { selectorPath: "section#hero", headingText: "Apex Roofing Contractors in Dallas, TX", bbox: { x: 0, y: 80, w: 1440, h: 700 } },
          { selectorPath: "section#reviews", headingText: "Customer Reviews", bbox: { x: 0, y: 780, w: 1440, h: 600 } },
          { selectorPath: "section#about", headingText: "About Our Family Business", bbox: { x: 0, y: 1380, w: 1440, h: 600 } },
        ],
        reviewWidgets: [],
      },
      screenshotSource: "playwright",
      faces: [
        { imageSrc: "/owner-photo.jpg", count: 1, largestAreaRatio: 0.12 },
      ],
    };

    const signals = await detectTrust(rendered, "https://apexroofing.com");

    // 1. Schema valid
    const parsed = TrustSignalsSchema.safeParse(signals);
    expect(parsed.success).toBe(true);

    // 2. Header slots
    const headerSlots = signals.regions.header.slots;
    expect(headerSlots.find((s) => s.slot === "logo_present")?.state).toBe("found");
    expect(headerSlots.find((s) => s.slot === "phone_link")?.state).toBe("found");
    expect(headerSlots.find((s) => s.slot === "cta_button_top_right")?.state).toBe("found");

    // 3. Hero slots
    const heroSlots = signals.regions.hero.slots;
    expect(heroSlots.find((s) => s.slot === "h1_contains_town")?.state).toBe("found");
    expect(heroSlots.find((s) => s.slot === "branded_truck")?.state).toBe("found");
    expect(heroSlots.find((s) => s.slot === "credential_chips")?.state).toBe("found");
    expect(heroSlots.find((s) => s.slot === "risk_reversal_phrase")?.state).toBe("found");
    expect(heroSlots.find((s) => s.slot === "quote_form_above_fold")?.state).toBe("found");

    // 4. Reviews slots
    const reviewSlots = signals.regions.reviews.slots;
    expect(reviewSlots.find((s) => s.slot === "platform_logo_on_cards")?.state).toBe("found");
    expect(reviewSlots.find((s) => s.slot === "star_rating_shown")?.state).toBe("found");
    expect(reviewSlots.find((s) => s.slot === "link_back_to_source")?.state).toBe("found");
    expect(reviewSlots.find((s) => s.slot === "card_count")?.state).toBe("found");

    // 5. About slots
    const aboutSlots = signals.regions.about.slots;
    expect(aboutSlots.find((s) => s.slot === "first_person_bio")?.state).toBe("found");
    expect(aboutSlots.find((s) => s.slot === "signature_image")?.state).toBe("found");
    expect(aboutSlots.find((s) => s.slot === "on_homepage")?.state).toBe("found");
  });

  test("handles empty page gracefully without throwing", async () => {
    const emptyRendered: RenderedTrustPage = {
      html: "<html><body><div>Just some placeholder text</div></body></html>",
      layout: {
        images: [],
        sections: [],
        reviewWidgets: [],
      },
      screenshotSource: "none",
      faces: [],
    };

    const signals = await detectTrust(emptyRendered, "https://empty-example.com");

    const parsed = TrustSignalsSchema.safeParse(signals);
    expect(parsed.success).toBe(true);

    expect(signals.regions.hero.found).toBe(false);
    expect(signals.regions.hero.slots.every((s) => s.state === "missing")).toBe(true);
  });
});
