# Broker OS

Technical Core MVP for a residential brokerage, implemented from the approved 10-day PRD. This repository currently contains **Day 1 only**: the application and infrastructure foundation.

## Day 1 scope

- Next.js App Router, TypeScript, React, Tailwind CSS
- White-label public settings with validation and safe local defaults
- Server-only Supabase administration and Cloudflare R2 client boundaries
- Docker standalone production image and health endpoint
- Unit tests for deployment configuration

Schema, authentication flows, PID/RID generation, intake, matching, WhatsApp, and all post-core capabilities are intentionally not included yet.

## Local setup

1. Copy `.env.example` to `.env.local` and replace the infrastructure placeholders.
2. Install dependencies with `pnpm install`.
3. Run `pnpm dev` and open `http://localhost:3000`.

The landing page uses safe local public defaults. Server-only Supabase and R2 clients validate their required settings when invoked, so secrets are never embedded into the browser bundle.

## Verification

Run `pnpm verify` for TypeScript, lint, unit tests, and a production build. For a production-equivalent container, copy `.env.example` to `.env`, replace its values, then run `docker compose up --build`.
