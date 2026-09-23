import fs from "fs";
import path from "path";
import { DesignSchema } from "../schema/design-schema";

export interface ContentBounds {
  aboutParagraphs: { min: number; max: number };
  services: { min: number; max: number };
  subBadges: { min: number; max: number };
}

/**
 * Reads a design's schema.json and extracts the min/max content counts
 * for specific repeatable elements that the AI copy generator creates.
 * If a section or schema is missing, returns safe defaults.
 */
export function getContentBounds(designId: string): ContentBounds {
  const defaults: ContentBounds = {
    aboutParagraphs: { min: 2, max: 4 },
    services: { min: 4, max: 6 },
    subBadges: { min: 3, max: 3 },
  };

  try {
    const schemaPath = path.resolve(
      process.cwd(),
      `src/templates/${designId}/schema.json`
    );
    
    if (!fs.existsSync(schemaPath)) return defaults;

    const raw = fs.readFileSync(schemaPath, "utf8");
    const parsed = DesignSchema.parse(JSON.parse(raw));

    const aboutSection = parsed.sections.find((s) => s.type === "about");
    if (aboutSection) {
      defaults.aboutParagraphs = {
        min: aboutSection.min_count,
        max: aboutSection.max_count,
      };
    }

    const quoteFormSection = parsed.sections.find((s) => s.type === "quoteForm");
    if (quoteFormSection) {
      defaults.services = {
        min: quoteFormSection.min_count,
        max: quoteFormSection.max_count,
      };
    }

    const heroSection = parsed.sections.find((s) => s.type === "hero");
    if (heroSection) {
      defaults.subBadges = {
        min: heroSection.min_count,
        max: heroSection.max_count,
      };
    }

    return defaults;
  } catch (error) {
    console.warn(`Failed to parse content bounds for ${designId}, using defaults.`, error);
    return defaults;
  }
}
