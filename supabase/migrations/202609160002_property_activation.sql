begin;

create or replace function public.validate_property_activation() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if new.status = 'ACTIVE' and old.status is distinct from 'ACTIVE' then
    if new.owner_contact_id is null or new.locality is null or length(trim(new.locality)) = 0
      or new.property_type is null or length(trim(new.property_type)) = 0
      or new.bhk is null or new.area_sqft is null or new.price_amount is null
      or new.consent_confirmed_at is null or new.verified_at is null or new.verified_by is null then
      raise exception using errcode = '23514', message = 'property activation requirements are incomplete';
    end if;
    if not exists (
      select 1 from public.property_media
      where property_id = new.id and business_id = new.business_id and status = 'APPROVED'
    ) then
      raise exception using errcode = '23514', message = 'at least one approved media item is required';
    end if;
  end if;
  return new;
end
$$;

create trigger properties_activation_requirements
before update of status on public.properties
for each row execute function public.validate_property_activation();

create or replace function public.verify_and_activate_property(property_uuid uuid) returns public.properties
language plpgsql security invoker set search_path = public, pg_temp as $$
declare operator_id uuid; result public.properties;
begin
  select id into operator_id from public.users
  where auth_user_id = auth.uid() and business_id = public.current_business_id() and active
  limit 1;
  if operator_id is null then raise exception 'active operator is required'; end if;

  update public.properties
  set status = 'VERIFICATION_PENDING', updated_at = now()
  where id = property_uuid and business_id = public.current_business_id() and status = 'DRAFT';

  update public.properties
  set status = 'ACTIVE', verified_at = now(), verified_by = operator_id, updated_at = now()
  where id = property_uuid and business_id = public.current_business_id() and status = 'VERIFICATION_PENDING'
  returning * into result;

  if result.id is null then raise exception 'property must be a draft or verification-pending record'; end if;
  return result;
end
$$;

grant execute on function public.verify_and_activate_property(uuid) to authenticated;

commit;

