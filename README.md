# NOVICIA 2026

The event website and operations platform for NOVICIA 2026, organized by IEDC LBSCEK.

## MVP

- First-come, first-served registration with an atomic 30-seat capacity limit
- Secure participant passes with opaque QR tokens
- Role-based organizer access
- QR check-in and check-out through restricted database operations
- Audit-ready event operations

## Local setup

1. Run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase URL, publishable key, and app URL.
4. Apply the migration in `supabase/migrations/`.
5. Run `npm run dev`.

`.env.local` is ignored and must never be committed. Do not expose a Supabase service-role key through a `NEXT_PUBLIC_*` variable.

## Validation

```bash
npm run lint
npm run build
```
