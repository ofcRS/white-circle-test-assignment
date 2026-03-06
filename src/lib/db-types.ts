export interface ChatRow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  chat_id: string;
  role: string;
  parts: unknown[];
  created_at: string;
}
