begin;
create or replace function public.validate_requirement_activation() returns trigger language plpgsql as $$
begin
  if new.status = 'ACTIVE' and old.status is distinct from 'ACTIVE' then
    if new.consent_confirmed_at is null or cardinality(new.preferred_localities) = 0 or cardinality(new.property_types) = 0 or new.budget_max is null then
      raise exception using errcode = '23514', message = 'requirement activation requirements are incomplete';
    end if;
  end if;
  return new;
end $$;
create trigger requirements_activation_requirements before update of status on public.requirements for each row execute function public.validate_requirement_activation();
commit;
