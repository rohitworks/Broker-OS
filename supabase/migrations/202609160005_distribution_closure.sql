begin;
create or replace function public.close_property(property_uuid uuid, close_status public.property_status) returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare p public.properties;
begin
 if close_status not in ('RENTED','SOLD') then raise exception 'closure status must be RENTED or SOLD'; end if;
 select * into p from public.properties where id=property_uuid and business_id=public.current_business_id() for update;
 if p.id is null then raise exception 'property not found'; end if;
 if p.status in ('RENTED','SOLD') then return false; end if;
 if p.status <> 'ACTIVE' then raise exception 'only active property can close'; end if;
 update public.properties set status=close_status,closed_at=now() where id=p.id;
 update public.distribution_events set closure_notified_at=now() where property_id=p.id and closure_notified_at is null;
 return true;
end $$;
grant execute on function public.close_property(uuid,public.property_status) to authenticated;
commit;
