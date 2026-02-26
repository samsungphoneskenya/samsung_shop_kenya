import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/actions/search-actions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) || 8 : 8;

    const results = await searchProducts(q, limit);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { results: [], error: "Failed to search products" },
      { status: 500 }
    );
  }
}

