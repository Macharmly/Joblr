-- ============================================
-- Joblr - Initial Database Schema
-- ============================================

-- Enable UUID generation
create extension if not exists "pgcrypto";


-- ============================================
-- PROFILES
-- ============================================

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    email text,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================
-- COMPANIES
-- ============================================

create table public.companies (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    website text,
    industry text,
    location text,
    company_size text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================
-- APPLICATIONS
-- ============================================

create table public.applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    company_id uuid references public.companies(id) on delete set null,

    position text not null,

    -- Current stage of the application
    status text not null default 'Saved',

    -- Final result when the application is closed
    outcome text,

    job_url text,
    location text,
    work_setup text,
    employment_type text,

    salary_min numeric,
    salary_max numeric,
    currency text default 'PHP',

    source text,

    date_posted date,
    date_applied date,
    deadline date,

    priority text default 'Medium',

    description text,
    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint applications_status_check
        check (
            status in (
                'Saved',
                'Applied',
                'Screening',
                'Interview',
                'Assessment',
                'Final Interview',
                'Offer'
            )
        ),

    constraint applications_outcome_check
        check (
            outcome is null
            or outcome in (
                'Accepted',
                'Rejected',
                'Withdrawn',
                'Expired',
                'Unavailable',
                'Position Filled'
            )
        ),

    constraint applications_priority_check
        check (
            priority in (
                'Low',
                'Medium',
                'High'
            )
        )
);


-- ============================================
-- APPLICATION EVENTS
-- ============================================

create table public.application_events (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.applications(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,

    event_type text not null,
    title text not null,
    description text,

    event_date timestamptz not null default now(),
    created_at timestamptz not null default now()
);


-- ============================================
-- INTERVIEWS
-- ============================================

create table public.interviews (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.applications(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,

    type text,
    scheduled_at timestamptz,
    duration integer,

    location text,
    meeting_url text,
    interviewer text,

    status text default 'Scheduled',

    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================
-- CONTACTS
-- ============================================

create table public.contacts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    company_id uuid references public.companies(id) on delete set null,

    name text not null,
    role text,
    email text,
    phone text,
    linkedin_url text,

    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================
-- DOCUMENTS
-- ============================================

create table public.documents (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    application_id uuid references public.applications(id) on delete cascade,

    type text not null,
    name text not null,
    storage_path text not null,

    created_at timestamptz not null default now()
);


-- ============================================
-- TASKS
-- ============================================

create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    application_id uuid references public.applications(id) on delete cascade,

    title text not null,
    description text,

    due_date timestamptz,
    priority text default 'Medium',

    completed boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint tasks_priority_check
        check (
            priority in (
                'Low',
                'Medium',
                'High'
            )
        )
);


-- ============================================
-- INDEXES
-- ============================================

create index applications_user_id_idx
    on public.applications(user_id);

create index applications_company_id_idx
    on public.applications(company_id);

create index applications_status_idx
    on public.applications(status);

create index applications_outcome_idx
    on public.applications(outcome);

create index applications_date_applied_idx
    on public.applications(date_applied);

create index application_events_application_id_idx
    on public.application_events(application_id);

create index application_events_user_id_idx
    on public.application_events(user_id);

create index interviews_application_id_idx
    on public.interviews(application_id);

create index interviews_user_id_idx
    on public.interviews(user_id);

create index contacts_user_id_idx
    on public.contacts(user_id);

create index contacts_company_id_idx
    on public.contacts(company_id);

create index documents_user_id_idx
    on public.documents(user_id);

create index documents_application_id_idx
    on public.documents(application_id);

create index tasks_user_id_idx
    on public.tasks(user_id);

create index tasks_application_id_idx
    on public.tasks(application_id);

create index tasks_due_date_idx
    on public.tasks(due_date);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;
alter table public.interviews enable row level security;
alter table public.contacts enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;


-- ============================================
-- PROFILES POLICIES
-- ============================================

create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);


-- ============================================
-- COMPANIES POLICIES
-- ============================================

create policy "Users can view their own companies"
on public.companies
for select
using (auth.uid() = user_id);

create policy "Users can create their own companies"
on public.companies
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own companies"
on public.companies
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own companies"
on public.companies
for delete
using (auth.uid() = user_id);


-- ============================================
-- APPLICATIONS POLICIES
-- ============================================

create policy "Users can view their own applications"
on public.applications
for select
using (auth.uid() = user_id);

create policy "Users can create their own applications"
on public.applications
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own applications"
on public.applications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own applications"
on public.applications
for delete
using (auth.uid() = user_id);


-- ============================================
-- APPLICATION EVENTS POLICIES
-- ============================================

create policy "Users can view their own application events"
on public.application_events
for select
using (auth.uid() = user_id);

create policy "Users can create their own application events"
on public.application_events
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own application events"
on public.application_events
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own application events"
on public.application_events
for delete
using (auth.uid() = user_id);


-- ============================================
-- INTERVIEWS POLICIES
-- ============================================

create policy "Users can view their own interviews"
on public.interviews
for select
using (auth.uid() = user_id);

create policy "Users can create their own interviews"
on public.interviews
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own interviews"
on public.interviews
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own interviews"
on public.interviews
for delete
using (auth.uid() = user_id);


-- ============================================
-- CONTACTS POLICIES
-- ============================================

create policy "Users can view their own contacts"
on public.contacts
for select
using (auth.uid() = user_id);

create policy "Users can create their own contacts"
on public.contacts
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own contacts"
on public.contacts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own contacts"
on public.contacts
for delete
using (auth.uid() = user_id);


-- ============================================
-- DOCUMENTS POLICIES
-- ============================================

create policy "Users can view their own documents"
on public.documents
for select
using (auth.uid() = user_id);

create policy "Users can create their own documents"
on public.documents
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own documents"
on public.documents
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
on public.documents
for delete
using (auth.uid() = user_id);


-- ============================================
-- TASKS POLICIES
-- ============================================

create policy "Users can view their own tasks"
on public.tasks
for select
using (auth.uid() = user_id);

create policy "Users can create their own tasks"
on public.tasks
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
on public.tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
on public.tasks
for delete
using (auth.uid() = user_id);


-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at();

create trigger companies_updated_at
before update on public.companies
for each row
execute function public.update_updated_at();

create trigger applications_updated_at
before update on public.applications
for each row
execute function public.update_updated_at();

create trigger interviews_updated_at
before update on public.interviews
for each row
execute function public.update_updated_at();

create trigger tasks_updated_at
before update on public.tasks
for each row
execute function public.update_updated_at();