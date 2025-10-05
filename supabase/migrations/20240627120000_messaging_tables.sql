create extension if not exists "pgcrypto";

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row
  execute function public.set_updated_at();

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (char_length(role) > 0),
  display_name text not null,
  avatar_url text,
  inserted_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);

create index if not exists participants_conversation_idx
  on public.participants (conversation_id);

create index if not exists participants_user_idx
  on public.participants (user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (char_length(sender_role) > 0),
  content text not null,
  topic text,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at desc);

create index if not exists messages_sender_idx
  on public.messages (sender_id);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  name text not null,
  content_type text,
  url text,
  storage_path text,
  size bigint,
  created_at timestamptz not null default now()
);

create index if not exists attachments_message_idx
  on public.attachments (message_id);

alter table public.conversations enable row level security;
alter table public.participants enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;

create or replace function public.is_conversation_member(conversation uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.participants p
    where p.conversation_id = conversation
      and p.user_id = auth.uid()
  );
$$;

create or replace function public.is_conversation_role(conversation uuid, required_role text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.participants p
    where p.conversation_id = conversation
      and p.user_id = auth.uid()
      and p.role = required_role
  );
$$;

create policy "Members can view conversations"
  on public.conversations
  for select
  using (public.is_conversation_member(id));

create policy "Service role can manage conversations"
  on public.conversations
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Users can manage their participant record"
  on public.participants
  for all
  using (auth.uid() = user_id or auth.role() = 'service_role')
  with check (auth.uid() = user_id or auth.role() = 'service_role');

create policy "Members can read messages"
  on public.messages
  for select
  using (public.is_conversation_member(conversation_id));

create policy "Participants send messages with matching role"
  on public.messages
  for insert
  with check (
    auth.uid() = sender_id
    and public.is_conversation_role(conversation_id, sender_role)
  );

create policy "Authors can update their messages"
  on public.messages
  for update
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

create policy "Members can view attachments"
  on public.attachments
  for select
  using (
    exists (
      select 1
      from public.messages m
      where m.id = attachments.message_id
        and public.is_conversation_member(m.conversation_id)
    )
  );

create policy "Participants can add attachments"
  on public.attachments
  for insert
  with check (
    exists (
      select 1
      from public.messages m
      where m.id = attachments.message_id
        and auth.uid() = m.sender_id
        and public.is_conversation_role(m.conversation_id, m.sender_role)
    )
  );

create policy "Service role can manage attachments"
  on public.attachments
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
