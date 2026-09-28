import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const supabase = createServerClient();

    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("slug", slug)
      .single();

    if (auditError || !audit) {
      return NextResponse.json(
        { success: false, error: "Audit not found" },
        { status: 404 }
      );
    }

    // Fetch all check scores
    let scores: any[] = [];
    if (audit.status === "complete" || audit.status === "running") {
      const { data: scoreData } = await supabase
        .from("audit_scores")
        .select("*")
        .eq("audit_id", audit.id)
        .order("category", { ascending: true });
      if (scoreData) {
        scores = scoreData;
      }
    }

    return NextResponse.json({
      success: true,
      audit: {
        ...audit,
        // Ensure audit_result is available (may be null pre-migration)
        audit_result: audit.audit_result || null,
        category_scores: audit.category_scores || null,
      },
      scores,
    });
  } catch (error: any) {
    console.error("Fetch audit error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch audit" },
      { status: 500 }
    );
  }
}
