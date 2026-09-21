# Lovable Cloud Migration Plan

## Goal
Move the app from the currently connected external Supabase backend to Lovable Cloud without losing functionality or production data.

## Migration scope
- Inventory the current database schema, policies, functions, authentication, storage buckets, files, secrets, and edge functions.
- Create or connect the Lovable Cloud backend for this project.
- Recreate the schema and security policies in Lovable Cloud using the project migration history, filling any gaps found in the live schema.
- Move required database records, user accounts where supported, and stored media without exposing credentials.
- Deploy edge functions and configure required runtime secrets in Lovable Cloud.
- Rebind the frontend to the Lovable Cloud project and regenerate backend types/configuration.
- Verify sign-up/sign-in, admin access, products, temples, bookings, visits and points, uploads, payments, reports, and public pages.

## Safety and rollout
- Preserve the current external Supabase backend until verification is complete; do not delete it.
- Take an export/backup before any cutover.
- Perform the final data copy during a short write freeze if live data changes during migration.
- Do not publish until authentication, admin permissions, storage, and critical user flows pass end-to-end checks.

## Technical details
- Preserve RLS and explicit Data API grants for every public table.
- Keep roles in the dedicated `user_roles` table and verify admin policies server-side.
- Migrate storage objects separately from database rows and update any backend-specific public URLs.
- Replace environment bindings only after the new backend is populated and tested.
- Reconfigure external secrets such as payment, email, mapping, or AI credentials through secure project secrets.

## Important limitation
Switching backends is infrastructure migration, not a frontend-only code change. Existing data and authenticated users do not appear automatically in Lovable Cloud; they must be explicitly migrated or the new Cloud backend will start empty.
