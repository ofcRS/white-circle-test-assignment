import { getMessages } from "@/lib/chat-db";
import type { UIMessage } from "ai";
import Home from "@/app/page";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const rows = await getMessages(chatId);

  const initialMessages: UIMessage[] = rows.map((row) => ({
    id: row.id,
    role: row.role as UIMessage["role"],
    parts: row.parts as UIMessage["parts"],
    createdAt: new Date(row.created_at),
  }));

  return <Home chatId={chatId} initialMessages={initialMessages} />;
}
