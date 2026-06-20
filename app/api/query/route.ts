import { openai } from "@/app/lib/Creds";
import { addMessage } from "@/app/lib/memory";
import queryPinecone from "@/app/lib/query";
import { NextResponse } from "next/server";

 // Define headers to allow your Vite frontend to access this endpoint
  const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5174", // Or use "*" to allow any origin during local dev
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

export async function POST(req: Request) {
  const body = await req.json();
  const query = body.query || '';
  const sessionId = body.sessionId || '';

  // const rewrittenQuery = await rewriteQuery(query);
  addMessage(sessionId, { role: "user", content:  query });
  // console.log("Rewritten Query:", rewrittenQuery);
  const results = await queryPinecone( query, sessionId);

  return NextResponse.json(
    results ?? { matches: [] },
    { status: 200, headers: corsHeaders }
  );
}


// Handle CORS Preflight OPTIONS requests automatically
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin":  "https://usman-portfolio.forenex.org",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}

export async function rewriteQuery(
  messages: string,
) {
  const res = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || '',
    messages: [
      {
        role: "system",
        content: `
You convert conversational questions into standalone search queries for a resume database.

Rules:
- Always resolve pronouns (he, him, his → candidate name)
- Keep intent intact
- Make it suitable for vector search
- Do NOT answer the question
- Only rewrite it
        `,
      },
      {
        role: "user",
        content: JSON.stringify(messages),
      },
    ],
  });

  return res.choices[0].message.content;
}