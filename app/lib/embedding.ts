import { log } from "console";
import OpenAI from "openai";
import { index } from "./Creds";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
log("OpenAI client initialized with API key:", !!process.env.OPENAI_API_KEY);


export const createEmbedding = async (chunk: string) => {
  
const embeddingResponse =
  await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunk,
    dimensions: Number(process.env.EMBEDDING_DIMENSION),
  });

return embeddingResponse.data[0].embedding;
}

export const upsertToPinecone = async (chunks: string[], resumeId: string) => {  
  try {
    // Process all chunks in parallel
    await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await createEmbedding(chunk);
        
        return index.upsert({
          records: [
            {
              id: crypto.randomUUID(),
              values: embedding,
              metadata: { resumeId, text: chunk },
            },
          ],
        });
      })
    );
    console.log("All chunks upsert successfully.");
  } catch (err: unknown) {
    const e = err as Error;
    console.error("Embedding error:", e?.message ?? e);
  }
};

export {openai};