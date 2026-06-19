import { openai } from "./Creds";

export const openaiAnalysis = async (question: string, context: string) => {
  const completion = await openai.chat.completions.create({
    model: String(process.env.GPT_MODEL),
    max_tokens: 150, // Prevents the response from running too long
    messages: [
      {
        role: "system",
        content: `
You are a technical recruiter reviewing a Usman's resume based on the provided context. 

### Core Rule:
1. **Length Constraint:** Keep your answer concise and straight to the point. Summarize into 50 words **Do not exceed 50 words total.**
2. **Explicit Matches:** If the context directly answers the question, provide a quick factual response.
3. **Inferential Reasoning (Bridge the Gap):** If a specific term (skill, project, tool, or hobby) is missing, do not just say "not mentioned." Look at the context provided. If there is a highly related proxy concept present, explain the connection naturally.
   * *Example:* If asked about SQL and it's missing, but Prisma is in the context, note that they have relational experience and can adapt quickly.
4. **Hard Stop:** If the concept is entirely missing and there are no logical proxies in the context to bridge from, state: "Information is not mentioned."
`,
      },
      {
        role: "user",
        content: `
Context:
${context}

Question:
${question}
`,
      },
    ],
  });

  return (
    completion?.choices?.[0]?.message?.content?.trim() ?? "No answer generated."
  );
};
