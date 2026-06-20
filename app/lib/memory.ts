// memory.ts

type Message = {
  role: "user" | "assistant";
  content: string;
};

const conversations = new Map<string, Message[]>();

export function getConversation(sessionId: string) {
  return conversations.get(sessionId) || [];
}

export function addMessage(
  sessionId: string,
  message: Message
) {
  const history = conversations.get(sessionId) || [];

  history.push(message);

  // Keep only recent messages
  const recentHistory = history.slice(-6);

  conversations.set(sessionId, recentHistory);
}

export function clearConversation(
  sessionId: string
) {
  conversations.delete(sessionId);
}