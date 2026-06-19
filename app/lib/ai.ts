import { openai } from "./Creds";

const createEmbedding = async (chunk: string) => {
  
const embeddingResponse =
  await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunk,
  });

return embeddingResponse.data.map((item) => item.embedding);
}
export default {openai, createEmbedding};