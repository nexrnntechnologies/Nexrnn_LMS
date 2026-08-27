import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export async function createContactQuery(userId, fields) {
  if (!isSupabaseConfigured) return { data: [{ id: `demo-query-${Date.now()}`, ...fields, status: "open", created_at: new Date().toISOString() }], error: null };
  return supabase.from("contact_queries").insert({
    user_id: userId || null,
    name: fields.name.trim(),
    mobile: fields.mobile.trim(),
    email: fields.email.trim(),
    message: fields.message.trim(),
  }).select().single();
}

export async function adminFetchContactQueries() {
  if (!isSupabaseConfigured) return { data: [], error: null };
  const { data, error } = await supabase.from("contact_queries").select("*").order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminUpdateContactQuery(id, fields) {
  if (!isSupabaseConfigured) return { error: null };
  return supabase.from("contact_queries").update(fields).eq("id", id);
}
