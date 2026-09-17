#!/usr/bin/env bash
set -euo pipefail

PG_BIN="${PG_BIN:-/opt/homebrew/opt/postgresql@15/bin}"
PG_PORT="${PG_PORT:-55439}"
DB_CHECK_DIR="$(mktemp -d /tmp/broker-os-pg.XXXXXX)"

cleanup() {
  "$PG_BIN/pg_ctl" -D "$DB_CHECK_DIR" stop >/dev/null 2>&1 || true
  case "$DB_CHECK_DIR" in /tmp/broker-os-pg.*) rm -rf -- "$DB_CHECK_DIR" ;; esac
}
trap cleanup EXIT

for binary in initdb pg_ctl createdb psql; do
  if [[ ! -x "$PG_BIN/$binary" ]]; then
    echo "PostgreSQL 15 is required. Install it with: brew install postgresql@15" >&2
    exit 1
  fi
done

"$PG_BIN/initdb" -D "$DB_CHECK_DIR" --auth=trust --no-locale >/dev/null
"$PG_BIN/pg_ctl" -D "$DB_CHECK_DIR" -o "-p $PG_PORT" -l "$DB_CHECK_DIR/server.log" start >/dev/null
"$PG_BIN/createdb" -p "$PG_PORT" broker_os_test

"$PG_BIN/psql" -v ON_ERROR_STOP=1 -p "$PG_PORT" -d broker_os_test >/dev/null <<'SQL'
create schema auth;
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create table auth.users (id uuid primary key default gen_random_uuid());
create or replace function auth.uid() returns uuid language sql stable as 'select null::uuid';
SQL

"$PG_BIN/psql" -v ON_ERROR_STOP=1 -p "$PG_PORT" -d broker_os_test -f supabase/migrations/202609160001_core_foundation.sql >/dev/null
"$PG_BIN/psql" -v ON_ERROR_STOP=1 -p "$PG_PORT" -d broker_os_test -f supabase/migrations/202609160002_property_activation.sql >/dev/null
"$PG_BIN/psql" -v ON_ERROR_STOP=1 -p "$PG_PORT" -d broker_os_test -f supabase/migrations/202609160003_property_microsite.sql >/dev/null
"$PG_BIN/psql" -v ON_ERROR_STOP=1 -p "$PG_PORT" -d broker_os_test -f supabase/migrations/202609160004_requirement_activation.sql >/dev/null
"$PG_BIN/psql" -v ON_ERROR_STOP=1 -p "$PG_PORT" -d broker_os_test -f supabase/migrations/202609160005_distribution_closure.sql >/dev/null
"$PG_BIN/psql" -v ON_ERROR_STOP=1 -p "$PG_PORT" -d broker_os_test -f supabase/seed.sql >/dev/null

"$PG_BIN/psql" -v ON_ERROR_STOP=1 -p "$PG_PORT" -d broker_os_test >/dev/null <<'SQL'
insert into auth.users(id) values ('50000000-0000-4000-8000-000000000001');
insert into public.users(business_id, auth_user_id, role, display_name)
values ('10000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 'OWNER', 'Test Operator');
create or replace function auth.uid() returns uuid language sql stable as 'select ''50000000-0000-4000-8000-000000000001''::uuid';

do $$ begin
  begin
    perform public.verify_and_activate_property('30000000-0000-4000-8000-000000000001');
    raise exception 'activation unexpectedly succeeded without approved media';
  exception when check_violation then
    if sqlerrm <> 'at least one approved media item is required' then raise; end if;
  end;
end $$;

insert into public.property_media(business_id, property_id, object_key, mime_type, byte_size, status)
values ('10000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'test/property.jpg', 'image/jpeg', 1024, 'APPROVED');

do $$ declare activated public.properties; begin
  activated := public.verify_and_activate_property('30000000-0000-4000-8000-000000000001');
  if activated.public_id <> 'PID-WH-R-00001' or activated.status <> 'ACTIVE' then
    raise exception 'unexpected activation result';
  end if;
end $$;

do $$ declare page_count integer; begin
  select count(*) into page_count from public.property_pages where slug = 'PID-WH-R-00001' and inquiries_enabled;
  if page_count <> 1 then raise exception 'active property page was not created'; end if;
end $$;

select public.create_public_property_inquiry('PID-WH-R-00001', 'Test Tenant', '+919876599999', 'tenant@example.test', 'INTERESTED', 'Please arrange a call', true, '60000000-0000-4000-8000-000000000001');
select public.create_public_property_inquiry('PID-WH-R-00001', 'Test Tenant', '+919876599999', 'tenant@example.test', 'INTERESTED', 'Please arrange a call', true, '60000000-0000-4000-8000-000000000001');

do $$ declare lead_count integer; begin
  select count(*) into lead_count from public.leads where source_key = '60000000-0000-4000-8000-000000000001';
  if lead_count <> 1 then raise exception 'duplicate public inquiry was created'; end if;
end $$;

update public.properties set status = 'RENTED' where id = '30000000-0000-4000-8000-000000000001';

do $$ declare enabled boolean; begin
  select inquiries_enabled into enabled from public.property_pages where slug = 'PID-WH-R-00001';
  if enabled then raise exception 'closed property page still accepts inquiries'; end if;
  begin
    perform public.create_public_property_inquiry('PID-WH-R-00001', 'Test Tenant', '+919876599999', '', 'INTERESTED', '', true, '60000000-0000-4000-8000-000000000002');
    raise exception 'closed property inquiry unexpectedly succeeded';
  exception when others then
    if sqlerrm <> 'property is unavailable for inquiries' then raise; end if;
  end;
end $$;
SQL

echo "Database migrations, PID activation, microsite lifecycle, and inquiry guards passed."
