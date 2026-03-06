import { NextResponse } from "next/server";
import { createChat, listChats } from "@/lib/chat-db";

export async function GET() {
  const chats = await listChats();
  return NextResponse.json(chats);
}

export async function POST(req: Request) {
  const { id, title } = await req.json();
  await createChat(id, title);
  return NextResponse.json({ id }, { status: 201 });
}
