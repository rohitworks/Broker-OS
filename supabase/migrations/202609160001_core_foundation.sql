begin;

create extension if not exists pgcrypto;

create type public.user_role as enum ('OWNER', 'OPERATOR');
create type public.transaction_type as enum ('RENT', 'RESALE');
create type public.property_status as enum ('DRAFT', 'VERIFICATION_PENDING', 'ACTIVE', 'PAUSED', 'STALE', 'RENTED', 'SOLD', 'WITHDRAWN', 'ARCHIVED');
create type public.requirement_status as enum ('DRAFT', 'ACTIVE', 'PAUSED', 'DORMANT', 'CLOSED', 'EXPIRED');
create type public.contact_kind as enum ('OWNER', 'SELLER', 'TENANT', 'BUYER', 'PARTNER_BROKER');
create type public.media_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type public.match_status as enum ('CANDIDATE', 'SHORTLISTED', 'REJECTED', 'EXPIRED');
create type public.shortlist_status as enum ('DRAFT', 'APPROVED', 'SENT', 'CANCELLED');
create type public.lead_status as enum ('NEW', 'CONTACTED', 'QUALIFIED', 'SHORTLISTED', 'INTERESTED', 'CLOSED', 'LOST', 'DORMANT');
create type public.delivery_status as enum ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');
create type public.task_status as enum ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');
create type public.failure_status as enum ('OPEN', 'RETRYING', 'RESOLVED', 'IGNORED');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  code text not null unique check (code ~ '^[A-Z0-9]{2,8}$'),
  base_url text not null check (base_url ~ '^https?://'),
  support_phone text not null check (support_phone ~ '^\+[1-9][0-9]{7,14}$'),
  default_locality text not null,
  locale text not null default 'en-IN',
  timezone text not null default 'Asia/Kolkata',
  currency char(3) not null default 'INR',
  brand_primary text not null default '#14532d' check (brand_primary ~ '^#[0-9A-Fa-f]{6}$'),
  brand_accent text not null default '#f59e0b' check (brand_accent ~ '^#[0-9A-Fa-f]{6}$'),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.user_role not null default 'OPERATOR',
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  kind public.contact_kind not null,
  full_name text not null,
  phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  email text,
  whatsapp_opted_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, phone_e164),
  unique (business_id, id)
);

create table public.reference_counters (
  business_id uuid not null references public.businesses(id) on delete restrict,
  counter_key text not null,
  last_value bigint not null default 0 check (last_value >= 0),
  primary key (business_id, counter_key)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  owner_contact_id uuid references public.contacts(id) on delete restrict,
  public_id text unique,
  transaction_type public.transaction_type not null,
  status public.property_status not null default 'DRAFT',
  locality text not null,
  society text,
  property_type text not null,
  bhk numeric(3,1) check (bhk > 0),
  area_sqft integer check (area_sqft > 0),
  price_amount numeric(14,2) check (price_amount > 0),
  available_from date,
  furnishing text,
  parking boolean,
  approximate_location jsonb not null default '{}'::jsonb,
  amenities text[] not null default '{}',
  occupancy_preferences jsonb not null default '{}'::jsonb,
  consent_confirmed_at timestamptz,
  verified_at timestamptz,
  verified_by uuid references public.users(id) on delete restrict,
  internal_notes text,
  materially_changed_at timestamptz,
  closed_at timestamptz,
  created_by uuid references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create table public.property_media (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete cascade,
  object_key text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.media_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  unique (business_id, object_key),
  unique (property_id, sort_order)
);

create table public.requirements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  public_id text unique,
  transaction_type public.transaction_type not null,
  status public.requirement_status not null default 'DRAFT',
  preferred_localities text[] not null default '{}',
  radius_km numeric(6,2) check (radius_km >= 0),
  property_types text[] not null default '{}',
  bhk_min numeric(3,1) check (bhk_min > 0),
  bhk_max numeric(3,1) check (bhk_max >= bhk_min),
  budget_min numeric(14,2) check (budget_min >= 0),
  budget_max numeric(14,2) check (budget_max >= budget_min),
  timeline date,
  furnishing text[],
  parking_required boolean,
  pets boolean,
  amenities text[] not null default '{}',
  occupancy_profile jsonb not null default '{}'::jsonb,
  visit_availability jsonb not null default '{}'::jsonb,
  brokerage_accepted boolean,
  consent_confirmed_at timestamptz,
  lead_source text,
  closed_at timestamptz,
  created_by uuid references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  purpose text not null,
  granted boolean not null,
  source text not null,
  recorded_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  requirement_id uuid not null references public.requirements(id) on delete restrict,
  score numeric(5,2) not null check (score between 0 and 100),
  reasons jsonb not null default '[]'::jsonb,
  status public.match_status not null default 'CANDIDATE',
  scoring_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, requirement_id, scoring_version),
  unique (business_id, id)
);

create table public.shortlists (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  requirement_id uuid not null references public.requirements(id) on delete restrict,
  status public.shortlist_status not null default 'DRAFT',
  approved_by uuid references public.users(id) on delete restrict,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create table public.shortlist_items (
  business_id uuid not null references public.businesses(id) on delete restrict,
  shortlist_id uuid not null references public.shortlists(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict,
  match_id uuid references public.matches(id) on delete restrict,
  sort_order integer not null check (sort_order between 1 and 5),
  primary key (shortlist_id, property_id),
  unique (shortlist_id, sort_order)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  property_id uuid references public.properties(id) on delete restrict,
  requirement_id uuid references public.requirements(id) on delete restrict,
  status public.lead_status not null default 'NEW',
  source text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_pages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  property_id uuid not null unique references public.properties(id) on delete cascade,
  slug text not null unique,
  published_at timestamptz,
  inquiries_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.distribution_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  idempotency_key text not null,
  property_id uuid not null references public.properties(id) on delete restrict,
  requirement_id uuid references public.requirements(id) on delete restrict,
  contact_id uuid references public.contacts(id) on delete restrict,
  channel text not null,
  template_name text,
  delivery_status public.delivery_status not null default 'QUEUED',
  external_message_id text,
  distributed_at timestamptz not null default now(),
  closure_notified_at timestamptz,
  unique (business_id, idempotency_key)
);

create table public.communications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  idempotency_key text not null,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  property_id uuid references public.properties(id) on delete restrict,
  requirement_id uuid references public.requirements(id) on delete restrict,
  direction text not null check (direction in ('INBOUND', 'OUTBOUND')),
  channel text not null,
  template_name text,
  payload jsonb not null default '{}'::jsonb,
  delivery_status public.delivery_status not null default 'QUEUED',
  created_at timestamptz not null default now(),
  unique (business_id, idempotency_key)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  property_id uuid references public.properties(id) on delete restrict,
  requirement_id uuid references public.requirements(id) on delete restrict,
  contact_id uuid references public.contacts(id) on delete restrict,
  title text not null,
  status public.task_status not null default 'OPEN',
  due_at timestamptz,
  assigned_to uuid references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.automation_failures (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  workflow_name text not null,
  operation_key text not null,
  property_id uuid references public.properties(id) on delete restrict,
  requirement_id uuid references public.requirements(id) on delete restrict,
  status public.failure_status not null default 'OPEN',
  attempt_count integer not null default 1 check (attempt_count > 0),
  error_code text,
  error_message text not null,
  payload jsonb not null default '{}'::jsonb,
  next_retry_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, workflow_name, operation_key)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete restrict,
  actor_user_id uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  old_value jsonb,
  new_value jsonb,
  occurred_at timestamptz not null default now()
);

create index properties_business_status_idx on public.properties (business_id, status, updated_at desc);
create index requirements_business_status_idx on public.requirements (business_id, status, updated_at desc);
create index contacts_business_phone_idx on public.contacts (business_id, phone_e164);
create index audit_entity_idx on public.audit_events (business_id, entity_type, entity_id, occurred_at desc);
create index failures_queue_idx on public.automation_failures (business_id, status, next_retry_at);
create index distribution_property_idx on public.distribution_events (business_id, property_id, distributed_at desc);

alter table public.properties add constraint properties_owner_same_business_fk foreign key (business_id, owner_contact_id) references public.contacts(business_id, id);
alter table public.properties add constraint properties_creator_same_business_fk foreign key (business_id, created_by) references public.users(business_id, id);
alter table public.properties add constraint properties_verifier_same_business_fk foreign key (business_id, verified_by) references public.users(business_id, id);
alter table public.property_media add constraint property_media_property_same_business_fk foreign key (business_id, property_id) references public.properties(business_id, id);
alter table public.requirements add constraint requirements_contact_same_business_fk foreign key (business_id, contact_id) references public.contacts(business_id, id);
alter table public.requirements add constraint requirements_creator_same_business_fk foreign key (business_id, created_by) references public.users(business_id, id);
alter table public.consents add constraint consents_contact_same_business_fk foreign key (business_id, contact_id) references public.contacts(business_id, id);
alter table public.matches add constraint matches_property_same_business_fk foreign key (business_id, property_id) references public.properties(business_id, id);
alter table public.matches add constraint matches_requirement_same_business_fk foreign key (business_id, requirement_id) references public.requirements(business_id, id);
alter table public.shortlists add constraint shortlists_requirement_same_business_fk foreign key (business_id, requirement_id) references public.requirements(business_id, id);
alter table public.shortlists add constraint shortlists_approver_same_business_fk foreign key (business_id, approved_by) references public.users(business_id, id);
alter table public.shortlist_items add constraint shortlist_items_shortlist_same_business_fk foreign key (business_id, shortlist_id) references public.shortlists(business_id, id);
alter table public.shortlist_items add constraint shortlist_items_property_same_business_fk foreign key (business_id, property_id) references public.properties(business_id, id);
alter table public.shortlist_items add constraint shortlist_items_match_same_business_fk foreign key (business_id, match_id) references public.matches(business_id, id);
alter table public.leads add constraint leads_contact_same_business_fk foreign key (business_id, contact_id) references public.contacts(business_id, id);
alter table public.leads add constraint leads_property_same_business_fk foreign key (business_id, property_id) references public.properties(business_id, id);
alter table public.leads add constraint leads_requirement_same_business_fk foreign key (business_id, requirement_id) references public.requirements(business_id, id);
alter table public.property_pages add constraint property_pages_property_same_business_fk foreign key (business_id, property_id) references public.properties(business_id, id);
alter table public.distribution_events add constraint distribution_property_same_business_fk foreign key (business_id, property_id) references public.properties(business_id, id);
alter table public.distribution_events add constraint distribution_requirement_same_business_fk foreign key (business_id, requirement_id) references public.requirements(business_id, id);
alter table public.distribution_events add constraint distribution_contact_same_business_fk foreign key (business_id, contact_id) references public.contacts(business_id, id);
alter table public.communications add constraint communications_contact_same_business_fk foreign key (business_id, contact_id) references public.contacts(business_id, id);
alter table public.communications add constraint communications_property_same_business_fk foreign key (business_id, property_id) references public.properties(business_id, id);
alter table public.communications add constraint communications_requirement_same_business_fk foreign key (business_id, requirement_id) references public.requirements(business_id, id);
alter table public.tasks add constraint tasks_property_same_business_fk foreign key (business_id, property_id) references public.properties(business_id, id);
alter table public.tasks add constraint tasks_requirement_same_business_fk foreign key (business_id, requirement_id) references public.requirements(business_id, id);
alter table public.tasks add constraint tasks_contact_same_business_fk foreign key (business_id, contact_id) references public.contacts(business_id, id);
alter table public.tasks add constraint tasks_assignee_same_business_fk foreign key (business_id, assigned_to) references public.users(business_id, id);
alter table public.automation_failures add constraint failures_property_same_business_fk foreign key (business_id, property_id) references public.properties(business_id, id);
alter table public.automation_failures add constraint failures_requirement_same_business_fk foreign key (business_id, requirement_id) references public.requirements(business_id, id);
alter table public.audit_events add constraint audit_actor_same_business_fk foreign key (business_id, actor_user_id) references public.users(business_id, id);

create or replace function public.current_business_id() returns uuid
language sql stable security definer set search_path = public, pg_temp as $$
  select business_id from public.users where auth_user_id = auth.uid() and active limit 1
$$;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end
$$;

create or replace function public.allocate_public_reference() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare business_code text; ref_counter_key text; next_value bigint; role_code text;
begin
  if new.public_id is not null then return new; end if;
  select code into strict business_code from public.businesses where id = new.business_id;
  if tg_table_name = 'properties' then
    role_code := case new.transaction_type when 'RENT' then 'R' else 'S' end;
    ref_counter_key := 'PID-' || role_code;
  else
    role_code := case new.transaction_type when 'RENT' then 'T' else 'B' end;
    ref_counter_key := 'RID-' || role_code;
  end if;
  insert into public.reference_counters (business_id, counter_key, last_value)
  values (new.business_id, ref_counter_key, 1)
  on conflict (business_id, counter_key) do update set last_value = public.reference_counters.last_value + 1
  returning last_value into next_value;
  new.public_id := split_part(ref_counter_key, '-', 1) || '-' || business_code || '-' || role_code || '-' || lpad(next_value::text, 5, '0');
  return new;
end
$$;

create or replace function public.prevent_public_reference_change() returns trigger language plpgsql as $$
begin
  if old.public_id is distinct from new.public_id then raise exception 'public reference is immutable'; end if;
  return new;
end
$$;

create or replace function public.enforce_property_status_transition() returns trigger language plpgsql as $$
begin
  if old.status = new.status then return new; end if;
  if not (
    (old.status = 'DRAFT' and new.status = 'VERIFICATION_PENDING') or
    (old.status = 'VERIFICATION_PENDING' and new.status in ('DRAFT','ACTIVE','WITHDRAWN')) or
    (old.status = 'ACTIVE' and new.status in ('PAUSED','STALE','RENTED','SOLD','WITHDRAWN')) or
    (old.status = 'PAUSED' and new.status in ('ACTIVE','STALE','WITHDRAWN')) or
    (old.status = 'STALE' and new.status in ('ACTIVE','PAUSED','WITHDRAWN')) or
    (old.status in ('RENTED','SOLD','WITHDRAWN') and new.status = 'ARCHIVED')
  ) then raise exception 'invalid property status transition: % -> %', old.status, new.status; end if;
  if new.status in ('RENTED','SOLD','WITHDRAWN') and new.closed_at is null then new.closed_at = now(); end if;
  return new;
end
$$;

create or replace function public.enforce_requirement_status_transition() returns trigger language plpgsql as $$
begin
  if old.status = new.status then return new; end if;
  if not (
    (old.status = 'DRAFT' and new.status = 'ACTIVE') or
    (old.status = 'ACTIVE' and new.status in ('PAUSED','DORMANT','CLOSED','EXPIRED')) or
    (old.status in ('PAUSED','DORMANT') and new.status in ('ACTIVE','CLOSED','EXPIRED'))
  ) then raise exception 'invalid requirement status transition: % -> %', old.status, new.status; end if;
  if new.status in ('CLOSED','EXPIRED') and new.closed_at is null then new.closed_at = now(); end if;
  return new;
end
$$;

create or replace function public.record_audit_event() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare row_data jsonb; actor_id uuid;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  select id into actor_id from public.users where auth_user_id = auth.uid() and active limit 1;
  insert into public.audit_events (business_id, actor_user_id, entity_type, entity_id, action, old_value, new_value)
  values ((row_data->>'business_id')::uuid, actor_id, tg_table_name, (row_data->>'id')::uuid, tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return case when tg_op = 'DELETE' then old else new end;
end
$$;

create trigger properties_allocate_ref before insert on public.properties for each row execute function public.allocate_public_reference();
create trigger requirements_allocate_ref before insert on public.requirements for each row execute function public.allocate_public_reference();
create trigger properties_immutable_ref before update on public.properties for each row execute function public.prevent_public_reference_change();
create trigger requirements_immutable_ref before update on public.requirements for each row execute function public.prevent_public_reference_change();
create trigger properties_status_guard before update on public.properties for each row execute function public.enforce_property_status_transition();
create trigger requirements_status_guard before update on public.requirements for each row execute function public.enforce_requirement_status_transition();

do $$ declare table_name text; begin
  foreach table_name in array array['businesses','users','contacts','properties','requirements','matches','shortlists','leads','property_pages','communications','tasks','automation_failures'] loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['contacts','properties','property_media','requirements','consents','matches','shortlists','leads','property_pages','distribution_events','communications','tasks','automation_failures'] loop
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.record_audit_event()', table_name, table_name);
  end loop;
end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['businesses','users','contacts','reference_counters','properties','property_media','requirements','consents','matches','shortlists','shortlist_items','leads','property_pages','distribution_events','communications','tasks','automation_failures','audit_events'] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

create policy businesses_same_business on public.businesses for select to authenticated using (id = public.current_business_id());
create policy users_same_business on public.users for select to authenticated using (business_id = public.current_business_id());

do $$ declare table_name text; begin
  foreach table_name in array array['contacts','properties','property_media','requirements','consents','matches','shortlists','shortlist_items','leads','property_pages','distribution_events','communications','tasks','automation_failures'] loop
    execute format('create policy %I_operator_access on public.%I for all to authenticated using (business_id = public.current_business_id()) with check (business_id = public.current_business_id())', table_name, table_name);
  end loop;
end $$;

create policy audit_events_read_only on public.audit_events for select to authenticated using (business_id = public.current_business_id());

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke all on public.reference_counters from anon, authenticated;
revoke insert, update, delete on public.audit_events from authenticated;

commit;
