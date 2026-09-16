begin;

alter table public.leads add column source_key text;
alter table public.leads add constraint leads_source_key_unique unique (business_id, source_key);

create or replace function public.sync_property_page() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if new.status = 'ACTIVE' then
    insert into public.property_pages (business_id, property_id, slug, published_at, inquiries_enabled)
    values (new.business_id, new.id, new.public_id, now(), true)
    on conflict (property_id) do update
      set slug = excluded.slug, published_at = coalesce(public.property_pages.published_at, excluded.published_at), inquiries_enabled = true, updated_at = now();
  elsif new.status in ('PAUSED', 'STALE', 'RENTED', 'SOLD', 'WITHDRAWN', 'ARCHIVED') then
    update public.property_pages set inquiries_enabled = false, updated_at = now()
    where property_id = new.id and business_id = new.business_id;
  end if;
  return new;
end
$$;

create trigger properties_sync_public_page
after insert or update of status on public.properties
for each row execute function public.sync_property_page();

insert into public.property_pages (business_id, property_id, slug, published_at, inquiries_enabled)
select business_id, id, public_id, coalesce(verified_at, now()), true
from public.properties where status = 'ACTIVE'
on conflict (property_id) do nothing;

create or replace function public.create_public_property_inquiry(
  p_public_id text,
  p_full_name text,
  p_phone_e164 text,
  p_email text,
  p_action text,
  p_message text,
  p_consent boolean,
  p_idempotency_key text
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare target_property public.properties; contact_uuid uuid; lead_uuid uuid; contact_type public.contact_kind;
begin
  if not p_consent then raise exception 'consent is required'; end if;
  if p_idempotency_key !~ '^[0-9a-fA-F-]{36}$' then raise exception 'invalid idempotency key'; end if;
  if p_action not in ('INTERESTED', 'QUESTION', 'CREATE_REQUIREMENT') then raise exception 'invalid inquiry action'; end if;
  if length(trim(p_full_name)) < 2 or p_phone_e164 !~ '^\+[1-9][0-9]{7,14}$' then raise exception 'invalid contact details'; end if;

  select p.* into target_property from public.properties p
  join public.property_pages pp on pp.property_id = p.id and pp.business_id = p.business_id
  where p.public_id = p_public_id and p.status in ('ACTIVE', 'PAUSED', 'STALE', 'RENTED', 'SOLD', 'WITHDRAWN', 'ARCHIVED')
  limit 1;
  if target_property.id is null then raise exception 'property page not found'; end if;
  if p_action <> 'CREATE_REQUIREMENT' and (target_property.status <> 'ACTIVE' or not exists (
    select 1 from public.property_pages where property_id = target_property.id and inquiries_enabled
  )) then raise exception 'property is unavailable for inquiries'; end if;

  select id into lead_uuid from public.leads where business_id = target_property.business_id and source_key = p_idempotency_key;
  if lead_uuid is not null then return lead_uuid; end if;

  contact_type := case when target_property.transaction_type = 'RENT' then 'TENANT' else 'BUYER' end;
  insert into public.contacts (business_id, kind, full_name, phone_e164, email)
  values (target_property.business_id, contact_type, trim(p_full_name), p_phone_e164, nullif(trim(p_email), ''))
  on conflict (business_id, phone_e164) do update
    set full_name = excluded.full_name, email = coalesce(excluded.email, public.contacts.email), updated_at = now()
  returning id into contact_uuid;

  insert into public.consents (business_id, contact_id, purpose, granted, source)
  values (target_property.business_id, contact_uuid, 'PROPERTY_PAGE_FOLLOW_UP', true, 'MICROSITE');

  insert into public.leads (business_id, contact_id, property_id, status, source, source_key)
  values (target_property.business_id, contact_uuid, target_property.id, 'NEW', 'MICROSITE_' || p_action, p_idempotency_key)
  returning id into lead_uuid;

  if nullif(trim(p_message), '') is not null then
    insert into public.communications (business_id, idempotency_key, contact_id, property_id, direction, channel, payload, delivery_status)
    values (target_property.business_id, gen_random_uuid()::text, contact_uuid, target_property.id, 'INBOUND', 'PROPERTY_PAGE', jsonb_build_object('action', p_action, 'message', trim(p_message)), 'DELIVERED');
  end if;

  insert into public.tasks (business_id, property_id, contact_id, title, status, due_at)
  values (target_property.business_id, target_property.id, contact_uuid,
    case when p_action = 'CREATE_REQUIREMENT' then 'Create requirement from ' || target_property.public_id else 'Respond to ' || lower(p_action) || ' lead for ' || target_property.public_id end,
    'OPEN', now() + interval '1 hour');

  return lead_uuid;
end
$$;

revoke all on function public.create_public_property_inquiry(text, text, text, text, text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.create_public_property_inquiry(text, text, text, text, text, text, boolean, text) to service_role;

commit;
