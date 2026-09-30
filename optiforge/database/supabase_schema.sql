-- Evaluation-ready schema. Apply only after creating/connecting a Supabase project.
create extension if not exists pgcrypto;
create table if not exists public.plant_records(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,field_name text not null,row_code text not null,plant_code text not null,latitude numeric,longitude numeric,created_at timestamptz not null default now(),unique(user_id,field_name,row_code,plant_code));
create table if not exists public.inspections(id uuid primary key default gen_random_uuid(),plant_record_id uuid not null references public.plant_records(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,condition_key text not null check(condition_key in('healthy','early_blight','late_blight','uncertain')),confidence numeric check(confidence between 0 and 1),severity text check(severity in('mild','moderate','severe')),model_version text not null,image_path text,created_at timestamptz not null default now());
alter table public.plant_records enable row level security;alter table public.inspections enable row level security;
create policy "owners manage plants" on public.plant_records for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "owners manage inspections" on public.inspections for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create index if not exists inspections_plant_time_idx on public.inspections(plant_record_id,created_at desc);
