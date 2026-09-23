export interface NicheCopy {
  tagline: string;
  emergencyBadge: string;
  heroPrefix: string;
  heroHighlight: string;
  heroSuffix: string;
  subBadges: Array<{ icon: string; text: string }>;
  heroCtaText: string;
  formTitle: string;
  services: string[];
  formSubmitText: string;
  aboutBadgeLabel: string;
  aboutHeadlineTemplate: (city: string) => string;
  aboutParagraphsTemplate: (businessName: string, city: string) => string[];
  aboutCtaText: string;
}

export const pestControlCopy: NicheCopy = {
  tagline: "Family-Owned Since 1979. Better Because We Care.",
  emergencyBadge: "24/7 Emergency Support",
  heroPrefix: "WEAR",
  heroHighlight: "THE CROWN",
  heroSuffix: "OF A PEST FREE HOME",
  subBadges: [
    { icon: "🛡️", text: "State Licensed & Insured" },
    { icon: "👩‍👧", text: "Kid & Pet Safe" },
    { icon: "👑", text: "Family-Owned Since 1979" },
  ],
  heroCtaText: "Get Pest control Help",
  formTitle: "REQUEST A FREE PEST CONTROL QUOTE",
  services: [
    "General Pest Inspection",
    "Termite Treatment & Prevention",
    "Rodent & Wildlife Exclusion",
    "Mosquito & Yard Barrier",
    "Bed Bug Eradication",
    "Commercial Facility Protection",
  ],
  formSubmitText: "Submit",
  aboutBadgeLabel: "About The Company",
  aboutHeadlineTemplate: (city: string) =>
    `FAMILY-OWNED PROTECTION FOR ${city.toUpperCase()} HOMES.`,
  aboutParagraphsTemplate: (businessName: string, city: string) => [
    `${businessName} has been protecting ${city} homes since 1979 — long before 'pest control' meant anything more than a family showing up, doing the job right, and treating your home like it was their own. Four decades later, that hasn't changed. We're still family-owned. We still send real technicians, not scripts. And we still believe a home should feel like a home — not a battleground.`,
    `Every treatment we run comes with a simple promise: if pests come back between visits, so do we, free of charge. No fine print, no upsells, no excuses. Just honest work from a team that's been earning ${city}'s trust one home at a time for over 45 years.`,
    `That's what wearing the crown means to us — not standing above our customers, but standing behind them.`,
  ],
  aboutCtaText: "LEARN MORE",
};

export const copyRegistry: Record<string, NicheCopy> = {
  "pest-control": pestControlCopy,
  pestcontrol: pestControlCopy,
};
