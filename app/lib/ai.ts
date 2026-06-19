import { log } from "console";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
log("OpenAI client initialized with API key:", !!process.env.OPENAI_API_KEY);


const createEmbedding = async (chunk: string) => {
const embeddingResponse =
  await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunk,
  });

return embeddingResponse.data.map((item) => item.embedding);
}
export default {openai, createEmbedding};