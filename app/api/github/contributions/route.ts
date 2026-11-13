import { NextRequest, NextResponse } from "next/server";
import { getContributionsData } from "@/lib/github/github.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");

    const currentYear = new Date().getFullYear();
    let year = currentYear;

    if (yearParam) {
      const parsedYear = parseInt(yearParam, 10);
      if (isNaN(parsedYear) || parsedYear < 2008 || parsedYear > 2100) {
        return NextResponse.json(
          {
            error: "Invalid year parameter. Must be a 4-digit year between 2008 and 2100.",
          },
          { status: 400 }
        );
      }
      year = parsedYear;
    }

    const data = await getContributionsData(year);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": data.complete
          ? "public, s-maxage=21600, stale-while-revalidate=3600"
          : "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      {
        error: "Failed to retrieve GitHub contributions data",
        message,
        complete: false,
      },
      { status: 500 }
    );
  }
}
