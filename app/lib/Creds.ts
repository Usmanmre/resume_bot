import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const pinecone = new Pinecone({
  apiKey: String(process.env.PINECONE_API_KEY),
});

export const index = pinecone.index(
  process.env.PINECONE_INDEX_NAME!
);


export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



export { pinecone };