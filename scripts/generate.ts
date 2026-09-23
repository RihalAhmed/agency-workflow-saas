import fs from "fs";
import path from "path";
import { logoToTokens } from "../src/lib/tokens";
import { SiteSpec } from "../src/lib/spec/site-spec";
import { pestControlCopy } from "../src/lib/copy/pest-control";

async function main() {
  const arg = process.argv[2];
  let inputData: {
    name?: string;
    category?: string;
    city?: string;
    phone?: string;
    email?: string;
    logoPath?: string;
    slug?: string;
  } = {};

  if (arg && fs.existsSync(path.resolve(process.cwd(), arg))) {
    const raw = fs.readFileSync(path.resolve(process.cwd(), arg), "utf8");
    inputData = JSON.parse(raw);
  }

  const name = inputData.name || "Crown Pest Control";
  const category = inputData.category || "pest-control";
  const city = inputData.city || "Jacksonville";
  const phone = inputData.phone || "(904) 743-1132";
  const email = inputData.email || "crownpestcontroljax@gmail.com";
  const logoRelative = inputData.logoPath || "/assets/logo.png";
  const slug =
    inputData.slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // Resolve local logo file for token extraction
  const logoLocalPath = path.resolve(
    process.cwd(),
    logoRelative.startsWith("/") ? `public${logoRelative}` : logoRelative
  );

  console.log(`Generating site spec for "${name}" (${category})...`);
  console.log(`Extracting tokens from logo: ${logoLocalPath}`);

  const tokens = await logoToTokens(logoLocalPath);
  const copy = pestControlCopy;

  const spec: SiteSpec = {
    site_spec_version: "1.1",
    slug,
    templateId: "crown-home",
    variantId: "a-photo-hero",
    business: {
      name,
      category,
      tagline: copy.tagline,
      city,
      phone,
      email,
      logoPath: logoRelative,
    },
    tokens,
    sections: [
      {
        type: "header",
        content: {
          tagline: copy.tagline,
          emergencyBadge: copy.emergencyBadge,
          ctaText: "GET A FREE QUOTE",
        },
        images: [logoRelative],
      },
      {
        type: "hero",
        content: {
          headlinePrefix: copy.heroPrefix,
          headlineHighlight: copy.heroHighlight,
          headlineSuffix: copy.heroSuffix,
          subBadges: copy.subBadges,
          ctaText: copy.heroCtaText,
          showTrustBadges: true,
        },
        images: ["/assets/hero-bg.jpg"],
      },
      {
        type: "quoteForm",
        content: {
          title: copy.formTitle,
          services: copy.services,
          submitButtonText: copy.formSubmitText,
        },
        images: [],
      },
      {
        type: "reviewLogos",
        content: {},
        images: ["/assets/review-row.png"],
      },
      {
        type: "about",
        content: {
          badgeLabel: copy.aboutBadgeLabel,
          headline: copy.aboutHeadlineTemplate(city),
          paragraphs: copy.aboutParagraphsTemplate(name, city),
          ctaText: copy.aboutCtaText,
        },
        images: ["/assets/about-house.jpg"],
      },
      {
        type: "footer",
        content: {},
        images: [logoRelative],
      },
    ],
  };

  // Validate with Zod
  const validated = SiteSpec.parse(spec);

  const prospectsDir = path.resolve(process.cwd(), "data/prospects");
  fs.mkdirSync(prospectsDir, { recursive: true });

  const outputFile = path.join(prospectsDir, `${slug}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(validated, null, 2), "utf8");

  console.log(`\nSiteSpec successfully written to:\n  ${outputFile}`);
  console.log(`\nPreview URL (run 'pnpm dev' first):`);
  console.log(`  http://localhost:3000/preview/${slug}`);
}

main().catch((err) => {
  console.error("Failed to generate site spec:", err);
  process.exit(1);
});
