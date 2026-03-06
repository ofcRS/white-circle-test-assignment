-- Chats table
create table if not exists chats (
  id uuid primary key,
  title text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Messages table
create table if not exists messages (
  id text primary key,
  chat_id uuid not null references chats(id) on delete cascade,
  role text not null,
  parts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_messages_chat_created on messages(chat_id, created_at asc);
create index if not exists idx_chats_updated on chats(updated_at desc);

-- Trigger: auto-update chats.updated_at on new message
create or replace function update_chat_updated_at()
returns trigger as $$
begin
  update chats set updated_at = now() where id = new.chat_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_chat_updated_at on messages;
create trigger trg_update_chat_updated_at
  after insert on messages
  for each row
  execute function update_chat_updated_at();
