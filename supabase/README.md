# Supabase setup

This folder is the source of truth for NOVICIA's database rules.

1. Create the Supabase project.
2. Link this repository with the Supabase CLI.
3. Apply `migrations/20260921000000_novicia_mvp_foundation.sql`.
4. In the `events` row, set `allowed_email_domain` to the exact official LBSCEK student email domain once confirmed.
5. Create the five organizer Auth users, then insert their profiles server-side:
   - 1 `SUPER_ADMIN`
   - 2 `EVENT_ADMIN`
   - 2 `CHECKIN_ADMIN`

Never insert participant records directly from the browser. Public registration must call `register_for_novicia`, which serializes requests and automatically closes registration after the 30th confirmed participant.

The one-time `pass_token` returned by the registration function is sensitive: send it only in the confirmation email or embed it into a signed/short-lived pass link. It must never be stored in browser logs or analytics.

`CHECKIN_ADMIN` never receives direct read or update access to the participants table. Event-day scans must use `record_attendance`, which exposes only the participant code, name, department, status, and recorded time.
