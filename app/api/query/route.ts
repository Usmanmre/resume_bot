import { addMessage } from "@/app/lib/memory";
import queryPinecone from "@/app/lib/query";
import { NextResponse } from "next/server";

// Dynamic CORS handler supporting localhost:5174 and your production domains
function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = ["http://localhost:5174", "https://usman-portfolio.forenex.org"];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function POST(req: Request) {
  try {
    const { query = "", sessionId = "" } = await req.json();

    await addMessage(sessionId, { role: "user", content: query });
    const results = await queryPinecone(query, sessionId);

    return NextResponse.json(
      results ?? { matches: [] }, 
      { status: 200, headers: getCorsHeaders(req) }
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(req) });
}