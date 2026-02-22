// This file initializes the Supabase client using Vite env vars.
// Prefer setting `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in a .env file.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://hrukgkkfkfvrhfkhfslk.supabase.co';
// Accept either the modern `VITE_SUPABASE_ANON_KEY` or the older
// `VITE_SUPABASE_PUBLISHABLE_KEY` that some setups use.
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydWtna2tma2Z2cmhma2hmc2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTgxMzgsImV4cCI6MjA3NDUzNDEzOH0.ZWNRly_ie8v_wKsREK25HKQ8b22FyAQXTOHFi4FyWks';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Use browser storage when available; Supabase client will gracefully
    // operate in environments without `localStorage` (e.g. SSR) if needed.
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});