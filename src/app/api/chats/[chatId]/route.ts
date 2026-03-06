import { NextResponse } from "next/server";
import { getMessages, deleteChat } from "@/lib/chat-db";
import type { UIMessage } from "ai";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const rows = await getMessages(chatId);

  const messages: UIMessage[] = rows.map((row) => ({
    id: row.id,
    role: row.role as UIMessage["role"],
    parts: row.parts as UIMessage["parts"],
    createdAt: new Date(row.created_at),
  }));

  return NextResponse.json(messages);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  await deleteChat(chatId);
  return NextResponse.json({ ok: true });
}
