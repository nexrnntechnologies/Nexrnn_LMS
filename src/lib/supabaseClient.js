import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If no env vars are set yet, `supabase` is null and the app falls back
// to the local mock data in src/data/mockData.js so the UI still runs
// during setup. Add your project's URL + anon key to .env to go live.
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes("YOUR-PROJECT-REF"));

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
