import { openai } from "./Creds";
import { getConversation } from "./memory";


export const openaiAnalysis = async (question: string, context: string, sessionId: string) => {
  const getPreviousMessages = await getConversation(sessionId);
  const completion = await openai.chat.completions.create({
    model: String(process.env.GPT_MODEL),
    max_tokens: 150, // Prevents the response from running too long
    messages: [
      {
        role: "system",
        content: `
You are a conversational recruiter assistant answering questions about Usman's experience.

Rules:
- Maximum 50 words.
- Use resume context and recent conversation history.
- Answer directly and naturally.
- Infer from closely related experience when appropriate.
- Resolve pronouns and follow-up questions using conversation context.
- Keep responses in plain english, no other formatting like '/n' or markdown, no inverted comas "" etc.
- If information cannot be determined, use Previous Messages to answer if unable to answer from previous messages, reply: "Information is not mentioned."
`,
      },
      ...getPreviousMessages, // memory window
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
