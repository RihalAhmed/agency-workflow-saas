import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { fetchRawHtml } from "@/lib/audit/fetchers/fetchRawHtml";
import { extractCompanyName } from "@/lib/audit/extractCompanyName";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let url = body.url || "";
    const targetKeyword = body.targetKeyword || null;

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL" },
        { status: 400 }
      );
    }

    const urlObj = new URL(url);
    // Create a URL-safe slug from the hostname
    const slug =
      urlObj.hostname.replace(/[^a-z0-9]/gi, "-").toLowerCase() +
      "-" +
      Date.now().toString().slice(-6);

    const supabase = createServerClient();

    // Try to fetch HTML and extract company name (timeout early so we don't block for long)
    let companyName = "";
    try {
      const htmlResult = await fetchRawHtml(url);
      companyName = extractCompanyName(htmlResult.rawHtml, url);
    } catch (e) {
      console.warn("Failed to fetch initial company name:", e);
    }

    // Create audit row in Supabase
    const insertPayload: Record<string, any> = {
      url,
      slug,
      status: "running",
      audit_result: companyName ? { companyName } : {},
    };

    // Add target_keyword if provided (column may not exist pre-migration)
    if (targetKeyword) {
      insertPayload.target_keyword = targetKeyword;
    }

    const { data: audit, error } = await supabase
      .from("audits")
      .insert(insertPayload)
      .select("id, slug")
      .single();

    if (error || !audit) {
      console.error("Supabase insert error:", error);

      // Retry without target_keyword if that column doesn't exist
      if (error?.message?.includes("target_keyword")) {
        delete insertPayload.target_keyword;
        const { data: retry, error: retryErr } = await supabase
          .from("audits")
          .insert(insertPayload)
          .select("id, slug")
          .single();

        if (retryErr || !retry) {
          return NextResponse.json(
            { success: false, error: "Failed to create audit record" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          auditId: retry.id,
          slug: retry.slug,
        });
      }

      return NextResponse.json(
        { success: false, error: "Failed to create audit record in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      auditId: audit.id,
      slug: audit.slug,
    });
  } catch (error: any) {
    console.error("Audit run error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to start audit" },
      { status: 400 }
    );
  }
}
