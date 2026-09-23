export type TrustBadgeDef = {
  id: string;
  label: string;
  logoPath: string;
  logoPathMono?: string;
  scope: "all" | string[];
};

export const TRUST_BADGE_CATALOG: TrustBadgeDef[] = [
  // PLATFORM (scope: "all")
  { id: "yelp", label: "Yelp", logoPath: "/assets/badges/yelp.svg", scope: "all" },
  { id: "bbb", label: "BBB Accredited", logoPath: "/assets/badges/bbb.svg", scope: "all" },
  { id: "facebook", label: "Facebook", logoPath: "/assets/badges/facebook.svg", scope: "all" },

  // SHARED SERVICE-INDUSTRY (scope: ["pest-control", "roofing"])
  { id: "angi-approved", label: "Angi Approved", logoPath: "/assets/badges/angi-approved.svg", scope: ["pest-control", "roofing"] },
  { id: "homeadvisor-approved", label: "HomeAdvisor Screened & Approved", logoPath: "/assets/badges/homeadvisor-approved.svg", scope: ["pest-control", "roofing"] },

  // PEST CONTROL ONLY (scope: ["pest-control"])
  { id: "npma-member", label: "NPMA Member", logoPath: "/assets/badges/npma-member.svg", scope: ["pest-control"] },
  { id: "qualitypro-certified", label: "QualityPro Certified", logoPath: "/assets/badges/qualitypro-certified.svg", scope: ["pest-control"] },

  // ROOFING ONLY (scope: ["roofing"])
  { id: "gaf-certified", label: "GAF Certified", logoPath: "/assets/badges/gaf-certified.svg", scope: ["roofing"] },
  { id: "owens-corning-preferred", label: "Owens Corning Preferred Contractor", logoPath: "/assets/badges/owens-corning-preferred.svg", scope: ["roofing"] },
  { id: "certainteed-shinglemaster", label: "CertainTeed SELECT ShingleMaster", logoPath: "/assets/badges/certainteed-shinglemaster.svg", scope: ["roofing"] },
];
