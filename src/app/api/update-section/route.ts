import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SiteSpec } from "@/lib/spec/site-spec";

function isObject(item: any): item is Record<string, any> {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, sectionId, content } = body;

    if (!slug || !sectionId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: slug, sectionId, content" },
        { status: 400 }
      );
    }

    const prospectsDir = path.join(process.cwd(), "data/prospects");
    const filePath = path.join(prospectsDir, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: `SiteSpec for slug '${slug}' not found.` },
        { status: 404 }
      );
    }

    const rawFile = fs.readFileSync(filePath, "utf8");
    let siteSpec: any;
    try {
      siteSpec = JSON.parse(rawFile);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Failed to parse existing JSON file." },
        { status: 500 }
      );
    }

    // Find the section by type (since sectionId in the UI is actually section.type)
    const sectionIndex = siteSpec.sections.findIndex((s: any) => s.type === sectionId);
    
    if (sectionIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Section '${sectionId}' not found in the SiteSpec.` },
        { status: 404 }
      );
    }

    // Deep merge the new content into the existing content
    siteSpec.sections[sectionIndex].content = deepMerge(
      siteSpec.sections[sectionIndex].content || {},
      content
    );

    // Validate the merged result
    let validatedSpec: SiteSpec;
    try {
      validatedSpec = SiteSpec.parse(siteSpec);
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: "Validation failed after merge.", details: e.errors || e.message },
        { status: 400 }
      );
    }

    // Write back to disk
    fs.writeFileSync(
      filePath,
      JSON.stringify(validatedSpec, null, 2),
      "utf8"
    );

    return NextResponse.json({ success: true, updatedSection: sectionId });

  } catch (error: any) {
    console.error("API update error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
