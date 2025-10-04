-- RLS Policies for institutions table
alter table public.institutions enable row level security;

create policy "Public institutions are viewable by all users"
on public.institutions for select
to authenticated
using (true);

create policy "Institutions can only be created by authenticated users"
on public.institutions for insert
to authenticated
with check (true);

create policy "Institutions can only be updated by admins"
on public.institutions for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
    and profiles.role = 'admin'
    and profiles.institution_id = id
  )
);

-- RLS Policies for profiles table
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all profiles in their institution"
on public.profiles for select
to authenticated
using (
  exists (
    select 1 from public.profiles admin_profile
    where admin_profile.user_id = auth.uid()
    and admin_profile.role = 'admin'
    and admin_profile.institution_id = institution_id
  )
);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- RLS Policies for curriculum table
alter table public.curriculum enable row level security;

create policy "Users can view curriculum from their institution"
on public.curriculum for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
    and profiles.institution_id = curriculum.institution_id
  )
);

create policy "Only admins can insert curriculum"
on public.curriculum for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
    and profiles.role = 'admin'
    and profiles.institution_id = curriculum.institution_id
  )
);

create policy "Only admins can delete curriculum"
on public.curriculum for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
    and profiles.role = 'admin'
    and profiles.institution_id = curriculum.institution_id
  )
);

-- RLS Policies for chat_sessions table
alter table public.chat_sessions enable row level security;

create policy "Users can view their own chat sessions"
on public.chat_sessions for select
to authenticated
using (
  student_id = auth.uid() or
  exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
    and profiles.role = 'admin'
    and profiles.institution_id = chat_sessions.institution_id
  )
);

create policy "Students can create their own chat sessions"
on public.chat_sessions for insert
to authenticated
with check (student_id = auth.uid());

create policy "Users can delete their own chat sessions"
on public.chat_sessions for delete
to authenticated
using (student_id = auth.uid());

-- Storage policies
create policy "Curriculum files are viewable by users in the same institution"
on storage.objects for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
    and profiles.institution_id = (
      select institution_id from public.curriculum
      where curriculum.file_url like '%' || storage.objects.name
    )
  )
);

create policy "Only admins can upload curriculum files"
on storage.objects for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Only admins can delete curriculum files"
on storage.objects for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = auth.uid()
    and profiles.role = 'admin'
  )
);