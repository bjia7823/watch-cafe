-- schema.sql
create table if not exists watched_movies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null default auth.uid(),
  title text not null,
  rating integer check (rating >= 1 and rating <= 5),
  urls jsonb,
  entry_time timestamp with time zone default now()
);

alter table watched_movies enable row level security;

create policy "Users can read their own movies" on watched_movies
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own movies" on watched_movies
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own movies" on watched_movies
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own movies" on watched_movies
  for delete
  using (auth.uid() = user_id);

