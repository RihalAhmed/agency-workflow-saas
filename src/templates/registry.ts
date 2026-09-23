import { meta as crownHomeMeta } from "./crown-home/template.config";
import { meta as nukingstreetMeta } from "./nukingstreet-pest/template.config";

export const templateMetas = [crownHomeMeta, nukingstreetMeta];
export type TemplateId = "crown-home" | "nukingstreet-pest";

export interface ResolvedTemplate {
  meta: typeof crownHomeMeta;
  sections: Record<string, React.ComponentType<any>>;
}

/**
 * Resolves a design template by ID.
 *
 * Implements true dynamic `import()` resolution (FU-1) that
 * reads the design ID at runtime and loads only that design's module
 * for effective code-splitting.
 */
export async function getTemplate(
  id: string
): Promise<ResolvedTemplate | null> {
  if (id === "crown-home") {
    return {
      meta: crownHomeMeta,
      sections: {
        header: (await import("./crown-home/sections/Header")).Header,
        hero: (await import("./crown-home/sections/Hero")).Hero,
        quoteForm: (await import("./crown-home/sections/QuoteForm")).QuoteForm,
        reviewLogos: (await import("./crown-home/sections/ReviewLogos")).ReviewLogos,
        about: (await import("./crown-home/sections/About")).About,
        footer: (await import("./crown-home/sections/Footer")).Footer,
      },
    };
  }
  
  if (id === "nukingstreet-pest") {
    return {
      meta: nukingstreetMeta,
      sections: {
        header: (await import("./nukingstreet-pest/sections/Header")).Header,
        hero: (await import("./nukingstreet-pest/sections/Hero")).Hero,
        quoteForm: (await import("./nukingstreet-pest/sections/QuoteForm")).QuoteForm,
        reviewLogos: (await import("./nukingstreet-pest/sections/ReviewLogos")).ReviewLogos,
        testimonials: (await import("./nukingstreet-pest/sections/Testimonials")).Testimonials,
        about: (await import("./nukingstreet-pest/sections/About")).About,
        footer: (await import("./nukingstreet-pest/sections/Footer")).Footer,
      },
    };
  }

  return null;
}
