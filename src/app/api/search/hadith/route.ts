import type { NextRequest } from "next/server";
import { indexAvailable, MAX_QUERY, searchHadith } from "@/lib/search/hadith-search";

/**
 * GET /api/search/hadith?q=…&book=bukhari&offset=20
 * Answers depend only on the URL, so the CDN may cache them (the index changes only with a new deploy).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").slice(0, MAX_QUERY);
  const book = params.get("book") ?? undefined;
  const offset = Number.parseInt(params.get("offset") ?? "0", 10);

  if (!indexAvailable()) {
    return Response.json({ error: "index-missing" }, { status: 503 });
  }
  const data = searchHadith(q, { book, offset: Number.isFinite(offset) ? Math.min(Math.max(offset, 0), 50_000) : 0 });
  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
