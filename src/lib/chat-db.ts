import { getSupabaseClient } from "@/lib/supabase";
import type { ChatRow, MessageRow } from "@/lib/db-types";

const db = () => getSupabaseClient();

export async function createChat(id: string, title: string) {
  const { error } = await db()
    .from("chats")
    .insert({ id, title });
  if (error) throw error;
}

export async function listChats(): Promise<ChatRow[]> {
  const { data, error } = await db()
    .from("chats")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getMessages(chatId: string): Promise<MessageRow[]> {
  const { data, error } = await db()
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function deleteChat(chatId: string) {
  const { error } = await db()
    .from("chats")
    .delete()
    .eq("id", chatId);
  if (error) throw error;
}

export async function saveMessage(msg: {
  id: string;
  chatId: string;
  role: string;
  parts: unknown[];
}) {
  const { error } = await db()
    .from("messages")
    .upsert({
      id: msg.id,
      chat_id: msg.chatId,
      role: msg.role,
      parts: msg.parts,
    });
  if (error) throw error;
}

export async function updateChatTitle(chatId: string, title: string) {
  const { error } = await db()
    .from("chats")
    .update({ title })
    .eq("id", chatId);
  if (error) throw error;
}
