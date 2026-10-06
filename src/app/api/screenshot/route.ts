import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("URL is required", { status: 400 });
    }

    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      return new NextResponse("PAGESPEED_API_KEY is not configured", { status: 500 });
    }

    // Call PageSpeed API to get the desktop screenshot
    const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("key", apiKey);
    endpoint.searchParams.set("strategy", "desktop");
    endpoint.searchParams.set("category", "performance");

    const response = await fetch(endpoint.toString(), {
      // Allow up to 30s for PSI to respond
      signal: AbortSignal.timeout(30000),
      next: { revalidate: 604800 }, // Cache for 7 days
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch from PageSpeed API", { status: response.status });
    }

    const data = await response.json();
    const screenshotData = data.lighthouseResult?.audits?.["final-screenshot"]?.details?.data;

    if (!screenshotData) {
      return new NextResponse("No screenshot available", { status: 404 });
    }

    // The data is formatted as "data:image/jpeg;base64,..."
    const base64Data = screenshotData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch (error) {
    console.error("Screenshot API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
