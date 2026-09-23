import { NextResponse } from "next/server";
import { scrapeTrustSignals } from "@/lib/trust/scrape-signals";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await scrapeTrustSignals(url);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Scrape trust route error:", error);
    return NextResponse.json(
      { error: "Failed to scrape trust signals" },
      { status: 500 }
    );
  }
}
