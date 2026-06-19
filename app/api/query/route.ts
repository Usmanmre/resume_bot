import queryPinecone from "@/app/lib/query";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: 'No query provided under "query" field' },
      { status: 400 },
    );
  }
  const results = await queryPinecone(query);
return NextResponse.json(results ?? { matches: [] });
}