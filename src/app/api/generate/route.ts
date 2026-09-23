import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { logoToTokens } from "@/lib/tokens";
import { SiteSpec } from "@/lib/spec/site-spec";
import { generateCompanyCopy, type GeneratedCopyOutput } from "@/lib/ai/copy-generator";
import { getFallbackImage } from "@/lib/images/stock-library";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let name = "Crown Pest Control";
    let category = "pest-control";
    let city = "Jacksonville";
    let phone = "(904) 743-1132";
    let email = "crownpestcontroljax@gmail.com";
    let logoRelative = "/assets/logo.png";
    let companyContext = "";
    let apiKey = "";
    let slug = "";
    let preEditedCopy: GeneratedCopyOutput | null = null;
    let trustBadges: string[] = [];
    let imageSlots: Record<string, string> = {};
    const uploadedImages: Record<string, string> = {};
    let templateId = "crown-home";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = (formData.get("name") as string) || name;
      category = (formData.get("category") as string) || category;
      city = (formData.get("city") as string) || city;
      phone = (formData.get("phone") as string) || phone;
      email = (formData.get("email") as string) || email;
      companyContext = (formData.get("companyContext") as string) || "";
      apiKey = (formData.get("apiKey") as string) || "";
      slug = (formData.get("slug") as string) || "";
      templateId = (formData.get("templateId") as string) || templateId;

      const copyRaw = formData.get("copy") as string | null;
      if (copyRaw) {
        try {
          preEditedCopy = JSON.parse(copyRaw);
        } catch {
          // Ignore parse error
        }
      }

      const trustBadgesRaw = formData.get("trustBadges") as string | null;
      if (trustBadgesRaw) {
        try {
          trustBadges = JSON.parse(trustBadgesRaw);
        } catch {
          // Ignore parse error
        }
      }

      const imageSlotsRaw = formData.get("imageSlots") as string | null;
      if (imageSlotsRaw) {
        try {
          imageSlots = JSON.parse(imageSlotsRaw);
        } catch {
          // Ignore parse error
        }
      }

      const uploadsDir = path.join(process.cwd(), "public/uploads");
      fs.mkdirSync(uploadsDir, { recursive: true });

      // Check for uploaded prospect images
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("image_") && value instanceof File && value.size > 0 && typeof value.arrayBuffer === "function") {
          const sanitizedName = value.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const fileName = `${Date.now()}-${sanitizedName}`;
          const filePath = path.join(uploadsDir, fileName);
          const bytes = await value.arrayBuffer();
          fs.writeFileSync(filePath, Buffer.from(bytes));
          const slot = imageSlots[key];
          if (slot) {
            uploadedImages[slot] = `/uploads/${fileName}`;
          }
        }
      }

      // Check for uploaded logo file
      const logoFile = formData.get("logo") as File | null;
      if (logoFile && logoFile.size > 0 && typeof logoFile.arrayBuffer === "function") {
        const sanitizedName = logoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}-${sanitizedName}`;
        const filePath = path.join(uploadsDir, fileName);

        const bytes = await logoFile.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(bytes));
        logoRelative = `/uploads/${fileName}`;
      } else if (formData.get("logoPath")) {
        logoRelative = formData.get("logoPath") as string;
      }
    } else {
      const body = await req.json();
      name = body.name || name;
      category = body.category || category;
      city = body.city || city;
      phone = body.phone || phone;
      email = body.email || email;
      logoRelative = body.logoPath || logoRelative;
      companyContext = body.companyContext || "";
      apiKey = body.apiKey || "";
      slug = body.slug || "";
      templateId = body.templateId || templateId;
      trustBadges = body.trustBadges || [];
      if (body.copy && body.copy.heroHighlight) {
        preEditedCopy = body.copy;
      }
    }

    if (!slug) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Resolve local logo file for token extraction
    const cleanRelative = logoRelative.startsWith("/")
      ? logoRelative.slice(1)
      : logoRelative;
    const sanitizedPath = cleanRelative.replace(/^public[\/\\]/, "");
    const logoLocalPath = path.join(process.cwd(), "public", sanitizedPath);

    const tokens = await logoToTokens(logoLocalPath);

    // If pre-edited copy was passed in, use it; otherwise generate via AI
    let copy: GeneratedCopyOutput;
    if (preEditedCopy && preEditedCopy.heroHighlight) {
      copy = preEditedCopy;
    } else {
      copy = await generateCompanyCopy({
        businessName: name,
        category,
        city,
        companyContext,
        apiKey,
      });
    }

    let sections: any[] = [];

    if (templateId === "crown-home") {
      sections = [
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
          images: [uploadedImages["hero"] || getFallbackImage(category, "hero")],
        },
        {
          type: "quoteForm",
          content: {
            title: copy.formTitle,
            services: copy.services,
            submitButtonText: copy.formSubmitText || "Submit",
          },
          images: [],
        },
        {
          type: "reviewLogos",
          content: {},
          images: [uploadedImages["reviewLogos"] || getFallbackImage(category, "reviewLogos")],
        },
        {
          type: "about",
          content: {
            badgeLabel: copy.aboutBadgeLabel,
            headline: copy.aboutHeadline,
            paragraphs: copy.aboutParagraphs,
            ctaText: copy.aboutCtaText,
          },
          images: [uploadedImages["about"] || getFallbackImage(category, "about")],
        },
        {
          type: "footer",
          content: {},
          images: [logoRelative],
        },
      ];
    } else if (templateId === "nukingstreet-pest") {
      sections = [
        {
          type: "header",
          content: {
            tagline: copy.tagline,
          },
          images: [logoRelative],
        },
        {
          type: "hero",
          content: {
            headlinePrefix: copy.heroPrefix,
            headlineHighlight: copy.heroHighlight,
            headlineSuffix: copy.heroSuffix,
            aiBadgeTitle: "AI-Powered Remote Monitoring",
            aiBadgeDesc: "High-tech protection between visits — we're watching so you don't have to.",
            ctaText: copy.heroCtaText,
          },
          images: [uploadedImages["hero"] || getFallbackImage(category, "hero")],
        },
        {
          type: "quoteForm",
          content: {
            title: copy.formTitle,
          },
          images: [],
        },
        {
          type: "reviewLogos",
          content: {},
          images: [],
        },
        {
          type: "about",
          content: {
            headline: copy.aboutHeadline,
            subhead: "Founded 2007 · Enfield, Connecticut",
            paragraph1: copy.aboutParagraphs?.[0] || "",
            paragraph2: copy.aboutParagraphs?.[1] || "",
          },
          images: [uploadedImages["about"] || getFallbackImage(category, "about")],
        },
        {
          type: "testimonials",
          content: {
            title: "Testimonials",
            subtitle: "Real feedback from satisfied customers",
          },
          images: [],
        },
        {
          type: "footer",
          content: {},
          images: [logoRelative],
        },
      ];
    }

    const spec: SiteSpec = {
      site_spec_version: "1.1",
      slug,
      templateId,
      variantId: "a-photo-hero",
      business: {
        name,
        category,
        tagline: copy.tagline,
        city,
        phone,
        email,
        logoPath: logoRelative,
        trustBadges: trustBadges as any,
      },
      tokens,
      sections,
    };

    const validated = SiteSpec.parse(spec);

    const prospectsDir = path.join(process.cwd(), "data/prospects");
    fs.mkdirSync(prospectsDir, { recursive: true });
    fs.writeFileSync(
      path.join(prospectsDir, `${slug}.json`),
      JSON.stringify(validated, null, 2),
      "utf8"
    );

    return NextResponse.json({
      success: true,
      slug,
      previewUrl: `/preview/${slug}`,
      tokens,
      copy,
      logoPath: logoRelative,
    });
  } catch (error: any) {
    console.error("API generate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate site" },
      { status: 400 }
    );
  }
}
