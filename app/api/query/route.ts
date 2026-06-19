import queryPinecone from "@/app/lib/query";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  // Define headers to allow your Vite frontend to access this endpoint
  const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5174", // Or use "*" to allow any origin during local dev
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: 'No query provided under "query" field' },
      { status: 400, headers: corsHeaders }
    );
  }

  const results = await queryPinecone(query);
  
  return NextResponse.json(
    results ?? { matches: [] },
    { status: 200, headers: corsHeaders }
  );
}

// Handle CORS Preflight OPTIONS requests automatically
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5174",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}