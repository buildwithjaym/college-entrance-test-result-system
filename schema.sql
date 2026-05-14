create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table school_years (
  id bigint generated always as identity primary key,
  label text not null unique,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table test_schedules (
  id bigint generated always as identity primary key,
  school_year_id bigint not null references school_years(id) on delete cascade,
  name text not null,
  exam_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create table applicants (
  id bigint generated always as identity primary key,
  reference_number text not null unique,
  first_name text not null,
  middle_name text,
  last_name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table results (
  id bigint generated always as identity primary key,
  applicant_id bigint not null references applicants(id) on delete cascade,
  school_year_id bigint not null references school_years(id) on delete restrict,
  test_schedule_id bigint not null references test_schedules(id) on delete restrict,

  overall_percentage numeric(5,2) not null check (overall_percentage >= 0 and overall_percentage <= 100),

  math_percentage numeric(5,2) check (math_percentage >= 0 and math_percentage <= 100),
  english_percentage numeric(5,2) check (english_percentage >= 0 and english_percentage <= 100),
  science_percentage numeric(5,2) check (science_percentage >= 0 and science_percentage <= 100),
  verbal_percentage numeric(5,2) check (verbal_percentage >= 0 and verbal_percentage <= 100),

  remarks text,
  result_file_url text,

  is_published boolean not null default false,
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (applicant_id, school_year_id, test_schedule_id)
);

create index idx_test_schedules_school_year_id on test_schedules(school_year_id);
create index idx_results_applicant_id on results(applicant_id);
create index idx_results_school_year_id on results(school_year_id);
create index idx_results_test_schedule_id on results(test_schedule_id);
create index idx_results_is_published on results(is_published);
create index idx_applicants_reference_number on applicants(reference_number);
create index idx_applicants_last_name on applicants(last_name);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_results_updated_at
before update on results
for each row
execute function set_updated_at();

-- RESULTS TABLE
create index if not exists idx_results_created_at
on results (created_at desc);

create index if not exists idx_results_is_published
on results (is_published);

create index if not exists idx_results_applicant_id
on results (applicant_id);

create index if not exists idx_results_test_schedule_id
on results (test_schedule_id);

-- APPLICANTS SEARCH OPTIMIZATION
create index if not exists idx_applicants_reference_number
on applicants (reference_number);

create index if not exists idx_applicants_email
on applicants (email);

-- FULL NAME SEARCH (IMPORTANT)
create index if not exists idx_applicants_name_search
on applicants using gin (
  to_tsvector('simple',
    coalesce(first_name,'') || ' ' ||
    coalesce(middle_name,'') || ' ' ||
    coalesce(last_name,'')
  )
);

-- TEST SCHEDULES SEARCH
create index if not exists idx_test_schedules_name
on test_schedules (name);


create index if not exists idx_results_overall_percentage
on results (overall_percentage);

create index if not exists idx_results_published_created_at
on results (is_published, created_at desc);

create index if not exists idx_results_published_percentage
on results (is_published, overall_percentage desc);



create extension if not exists pgcrypto;

create table public.result_verifications (
  id bigint generated always as identity not null,
  result_id bigint not null,

  verification_token text not null,
  verification_code text not null,
  verification_hash text not null,

  is_active boolean not null default true,
  revoked_at timestamp with time zone null,
  revoked_reason text null,

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint result_verifications_pkey primary key (id),

  constraint result_verifications_result_id_key unique (result_id),
  constraint result_verifications_token_key unique (verification_token),
  constraint result_verifications_code_key unique (verification_code),

  constraint result_verifications_result_id_fkey
    foreign key (result_id)
    references public.results (id)
    on delete cascade
);


create index if not exists idx_result_verifications_result_id
on public.result_verifications using btree (result_id);

create index if not exists idx_result_verifications_token
on public.result_verifications using btree (verification_token);

create index if not exists idx_result_verifications_code
on public.result_verifications using btree (verification_code);

create index if not exists idx_result_verifications_is_active
on public.result_verifications using btree (is_active);


create trigger trg_result_verifications_updated_at
before update on public.result_verifications
for each row
execute function set_updated_at();



create table public.result_verification_logs (
  id bigint generated always as identity not null,
  verification_id bigint null,

  token_used text not null,
  status text not null,
  ip_address text null,
  user_agent text null,

  created_at timestamp with time zone not null default now(),

  constraint result_verification_logs_pkey primary key (id),

  constraint result_verification_logs_verification_id_fkey
    foreign key (verification_id)
    references public.result_verifications (id)
    on delete set null,

  constraint result_verification_logs_status_check
    check (
      status in (
        'verified',
        'invalid',
        'revoked',
        'hash_mismatch'
      )
    )
);



create index if not exists idx_result_verification_logs_verification_id
on public.result_verification_logs using btree (verification_id);

create index if not exists idx_result_verification_logs_token_used
on public.result_verification_logs using btree (token_used);

create index if not exists idx_result_verification_logs_created_at
on public.result_verification_logs using btree (created_at desc);

create index if not exists idx_result_verification_logs_status
on public.result_verification_logs using btree (status);

alter table public.result_verifications enable row level security;
alter table public.result_verification_logs enable row level security;



drop policy if exists "Public can view active result verifications"
on public.result_verifications;

create policy "Public can view active result verifications"
on public.result_verifications
for select
to anon, authenticated
using (
  is_active = true
  and revoked_at is null
);