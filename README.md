# NOVICIA 2026

The event website and event-day operations platform for **NOVICIA 2026**, organized by IEDC LBSCEK.

> Begin. Explore. Become.

## Live event configuration

| Setting | Value |
| --- | --- |
| Event | NOVICIA 2026 |
| Date | 26 September 2026, 4:00 PM – 27 September 2026, 8:00 AM |
| Venue | ASAP OpenMind, Kasaragod |
| Capacity | 30 confirmed participants |
| Registration | First come, first served |

The live `novicia-2026` event is configured for real registrations. Do not use it for test registrations: each successful submission reserves a real seat.

## MVP workflow

```text
Register
  → atomic PostgreSQL capacity reservation
  → confirmed participant ID
  → secure QR pass
  → organizer QR check-in
  → organizer QR check-out
  → audit trail and reports
```

### Included

- Atomic 30-seat, first-come-first-served registration
- Duplicate protection for admission number and email address
- Opaque QR tokens; passes never expose contact or emergency information
- Public participant pass at `/pass/<token>`
- Fixed admin roles: `SUPER_ADMIN`, `EVENT_ADMIN`, `CHECKIN_ADMIN`
- Restricted server-side attendance operations and audit logs
- Phone-oriented browser QR scanner with check-in/check-out modes
- Supabase Row Level Security policies

### Still to validate operationally

- First real participant registration and pass retrieval
- IEDC confirmation-email delivery integration
- Admin account login and role checks
- HTTPS phone QR scanning on Android Chrome and iPhone Safari
- Restricted manual attendance lookup
- CSV export and full event rehearsal

## Stack

Next.js · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, RLS) · Vercel

## Local setup

1. Run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set the following values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Apply [the Supabase migration](supabase/migrations/20260921000000_novicia_mvp_foundation.sql).
5. Run `npm run dev`.

`.env.local` is ignored and must never be committed. Do not expose a Supabase `service_role` key through any `NEXT_PUBLIC_*` variable.

## Production safety

- Keep all capacity and concurrency QA on a separate test event, never `novicia-2026`.
- Before opening live registration, verify the live event is `0 / 30` and intentionally open.
- Treat every successful live registration as a real participant seat.
- Preserve the opaque pass URL and QR code as the participant credential; do not place private participant details in the QR.

## Validation

```bash
npm run lint
npm run build
```
