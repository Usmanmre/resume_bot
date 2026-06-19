import { log } from "console";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
log("OpenAI client initialized with API key:", !!process.env.OPENAI_API_KEY);


export const createEmbedding = async (chunk: string) => {
  
const embeddingResponse =
  await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunk,
    dimensions: 1024,
  });

return embeddingResponse.data[0].embedding;
}
export {openai};