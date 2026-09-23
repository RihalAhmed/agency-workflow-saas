import type { SiteSpec, SiteSection } from "../spec/site-spec";

/**
 * Resolves raw SiteSection content and parent SiteSpec business data
 * into typed props ready to feed directly into section components.
 */
export function resolveSectionProps(
  section: SiteSection,
  spec: SiteSpec
): Record<string, unknown> {
  const { business } = spec;
  const content = section.content || {};
  const images = section.images || [];

  switch (section.type) {
    case "header":
      return {
        businessName: business.name,
        tagline: (content.tagline as string) || business.tagline || "Family-Owned Since 1979. Better Because We Care.",
        email: business.email || (content.email as string),
        phone: business.phone || (content.phone as string),
        logoUrl: business.logoPath || (content.logoUrl as string) || "/assets/logo.png",
        emergencyBadge: (content.emergencyBadge as string) || "24/7 Emergency Support",
        ctaText: (content.ctaText as string) || "GET A FREE QUOTE",
      };

    case "hero":
      return {
        headlinePrefix: (content.headlinePrefix as string) || "WEAR",
        headlineHighlight: (content.headlineHighlight as string) || "THE CROWN",
        headlineSuffix: (content.headlineSuffix as string) || "OF A PEST FREE HOME",
        subBadges: (content.subBadges as Array<{ icon: string; text: string }>) || [
          { icon: "🛡️", text: "State Licensed & Insured" },
          { icon: "👩‍👧", text: "Kid & Pet Safe" },
          { icon: "👑", text: "Family-Owned Since 1979" },
        ],
        ctaText: (content.ctaText as string) || "Get Pest control Help",
        backgroundImageUrl: images[0] || "/assets/hero-bg.jpg",
        showTrustBadges: content.showTrustBadges !== false,
      };

    case "quoteForm":
      return {
        businessName: business.name,
        title: (content.title as string) || "REQUEST A FREE PEST CONTROL QUOTE",
        services: (content.services as string[]) || undefined,
        submitButtonText: (content.submitButtonText as string) || "Submit",
        consentText: (content.consentText as string) || undefined,
      };

    case "reviewLogos":
      return {
        trustBadges: business.trustBadges,
      };

    case "about":
      return {
        businessName: business.name,
        city: business.city || (content.city as string) || "Jacksonville",
        headline: (content.headline as string) || undefined,
        badgeLabel: (content.badgeLabel as string) || "About The Company",
        imagePath: images[0] || "/assets/about-house.jpg",
        paragraphs: (content.paragraphs as string[]) || undefined,
        ctaText: (content.ctaText as string) || "LEARN MORE",
      };

    case "footer":
      return {
        businessName: business.name,
        logoUrl: business.logoPath || "/assets/logo.png",
        phone: business.phone,
        email: business.email,
        city: business.city,
      };

    default:
      return {
        businessName: business.name,
        ...content,
      };
  }
}
