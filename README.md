# Broker OS

Technical Core MVP for a residential brokerage, implemented from the approved 10-day PRD. This repository currently contains the completed **Day 1 through Day 4** foundations.

## Day 1 scope

- Next.js App Router, TypeScript, React, Tailwind CSS
- White-label public settings with validation and safe local defaults
- Server-only Supabase administration and Cloudflare R2 client boundaries
- Docker standalone production image and health endpoint
- Unit tests for deployment configuration

## Day 2 scope

- Versioned Supabase migration for every Core MVP entity
- Per-business row-level security and cross-business ownership constraints
- Permanent, transaction-aware PID/RID allocation with immutable public references
- Database and TypeScript lifecycle guards for properties and requirements
- Automatic audit events and idempotency constraints
- Supabase password authentication, refreshed sessions, protected `/admin`, and sign-out
- Realistic draft property, requirement, contact, consent, and business seed data

Requirement intake, matching, WhatsApp, public microsites, and all post-core capabilities are intentionally not included yet.

## Day 3 scope

- Authenticated property list, intake form, and property record screen
- Permanent PID allocation on draft creation
- Private direct-to-R2 uploads with short-lived signed URLs and server-side object verification
- Operator media approval
- Database-enforced verification and activation requirements
- Activation blocked unless consent, pricing, configuration, verification, and approved media are present

The Day 5 requirement intake and RID administration are intentionally not included yet.

## Day 4 scope

- Dynamic, mobile-first `/p/[PID]` property pages
- Allowlisted public data model that excludes contacts, internal notes, exact unit data, object keys, and private documents
- Approved media delivery through five-minute signed R2 reads
- No-index/no-follow headers and metadata
- Idempotent interest, question, and create-requirement actions
- Consent, inbound communication, lead, and one-operating-hour task recording
- Closed property state that disables property inquiries and offers the Day 5 requirement path

## Local setup

1. Copy `.env.example` to `.env.local` and replace the infrastructure placeholders.
2. Install dependencies with `pnpm install`.
3. Run `pnpm dev` and open `http://localhost:3000`.

For a local Supabase stack, install the Supabase CLI, run `supabase start`, then `supabase db reset`. Create an Auth user with signups disabled and link it to the seeded business:

```sql
insert into public.users (business_id, auth_user_id, role, display_name)
values ('10000000-0000-4000-8000-000000000001', '<auth-user-uuid>', 'OWNER', 'Pilot Operator');
```

The landing page uses safe local public defaults. Server-only Supabase and R2 clients validate their required settings when invoked, so secrets are never embedded into the browser bundle.

## Verification

Run `pnpm verify` for TypeScript, lint, unit tests, and a production build. For a production-equivalent container, copy `.env.example` to `.env`, replace its values, then run `docker compose up --build`.

Run `pnpm test:e2e` for the Playwright browser smoke journey.

Run `pnpm test:db` for an isolated PostgreSQL migration, seed, PID allocation, and activation-guard test. It uses PostgreSQL 15 installed by Homebrew and never starts a persistent service.
