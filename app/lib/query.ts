import { createEmbedding } from "./embedding";
import { index } from "./Creds";
import { openaiAnalysis } from "./openai";
import { addMessage } from "./memory";

export type QueryResult = {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
};

export async function queryPinecone(
  query: string,
  sessionId: string,
  topK = 3,
) {
  try {
    const vector = await createEmbedding(query);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await index.query({
      vector: vector,
      topK: topK,
      includeMetadata: true,
    //   filter: {
    //     resumeId: { $eq: resumeId },
    //   },
    });
   const openaiResponse = await openaiAnalysis(query, JSON.stringify(results), sessionId);
   addMessage(sessionId, { role: "assistant", content: openaiResponse });
    return openaiResponse;
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    console.error("queryPinecone error:", e?.message ?? e);
    return [];
  }
}

export default queryPinecone;
