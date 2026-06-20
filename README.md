This repository contains a Next.js app that hosts a small RAG-style resume chatbot.

Highlights
- Upload PDF resumes to the server and automatically extract and chunk the text.
- Chunks are embedded and upserted to a Pinecone index.
- A query endpoint returns semantic search results from Pinecone.
- A streaming `/api/answer` endpoint uses OpenAI to answer questions with context and streams tokens back to the client (SSE).
- The chat also keeps an in-memory message context so short conversations retain prior messages during a session.

Quick start
1. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

2. Open the app at http://localhost:3000

Required environment variables
- OPENAI_API_KEY — OpenAI API key
- PINECONE_API_KEY — Pinecone API key
- PINECONE_INDEX_NAME — Pinecone index name
- GPT_MODEL — model id used for chat completions (e.g. gpt-4o-mini)
- EMBEDDING_DIMENSION — numeric embedding dimension used by OpenAI (optional)

Important endpoints
- POST /api/upload — upload a PDF (multipart/form-data, field name `file`). The server parses the PDF, chunks text, upserts embeddings to Pinecone, and returns the public URL and chunk preview.
- GET /api/chunk-resume — read the bundled `app/lib/resume.md` and return chunks (useful for local testing without uploading a PDF).
- GET/POST /api/query — semantic query endpoint. GET accepts ?query=..., POST accepts JSON { query }.
- POST /api/answer — streaming answer endpoint. POST JSON { question } and receive incremental tokens as SSE.

CORS
- The server is configured to allow browser requests from http://localhost:5174. If your frontend runs on a different origin, add it to the allowed origins in the code.

How the pipeline works
1. PDF upload (or reading the local `resume.md`) — text is extracted, sanitized, and split into chunks.
2. Each chunk is embedded using the OpenAI embedding API and upserted to Pinecone via `app/lib/embedding.ts`.
3. Querying: `app/lib/query.ts` creates an embedding for the user's query and finds nearest chunks in Pinecone.
4. Answering: `POST /api/answer` collects top matches, builds context, calls OpenAI (via `app/lib/openai.ts`), and streams back the response. The chat handler also maintains a short in-memory message context so multi-turn conversations can refer to previous messages.

Quick examples
- Upload a PDF (replace /path/to/resume.pdf):

```bash
curl -X POST 'http://localhost:3000/api/upload' -F "file=@/path/to/resume.pdf"
```

- Get the local resume chunks (handy for testing):

```bash
curl http://localhost:3000/api/chunk-resume
```

- Query semantic search (GET):

```bash
curl "http://localhost:3000/api/query?query=experience%20with%20SSE"
```

- Query semantic search (POST JSON):

```bash
curl -X POST http://localhost:3000/api/query -H 'Content-Type: application/json' -d '{"query":"real-time systems experience"}'
```

- Stream an answer (client must parse SSE or read the response stream):

```bash
curl -N -H "Content-Type: application/json" -X POST http://localhost:3000/api/answer -d '{"question":"What backend languages does this candidate use?"}'
```

Notes & next steps
- The project currently stores uploaded files in `public/uploads` so they are statically served. For production, consider cloud object storage (S3/GCS) and not serving user uploads from the public folder.
- The chunking function lives at `app/lib/chunking.ts` and is re-used for both PDF and local resume chunking.
- The code uses `pdf-parse-fork` to extract text from PDFs. If you see type warnings, ensure dependencies are installed (`npm install`) and consider adding local type declarations.
- The chat keeps messages in-memory for the running server process — this is simple and fine for local testing, but you may want to persist session state in a DB or Redis for production.

If you'd like, I can:
- Add a small React chat UI that uses the streaming endpoint and parses SSE frames.
- Switch file storage to S3 and update the upload flow.
- Persist per-user conversation history in Redis or a database.

License & deployment
This project is a typical Next.js app and can be deployed to Vercel or any Node host that supports Next.js.

