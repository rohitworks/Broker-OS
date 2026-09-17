# Production runbook

1. On the Hostinger KVM, create a restricted deployment directory and `.env` outside Git.
2. Set `BROKER_OS_DOMAIN`, Supabase, R2, WhatsApp, and backup variables. Do not use placeholder values.
3. Apply migrations with `supabase db push`, import the n8n workflows, then run `docker compose -f deploy/compose.production.yaml up -d`.
4. Confirm HTTPS, `/api/health`, structured logs, and uptime monitoring before pilot traffic.
5. Run `scripts/backup-postgres.sh` daily through the host scheduler; retain 7 daily and 4 weekly encrypted copies. Test a restore before launch.
