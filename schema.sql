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