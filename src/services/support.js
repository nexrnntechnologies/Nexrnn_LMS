import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export async function createSupportRequest(userId, fields) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  return supabase.from("support_requests").insert({
    user_id: userId,
    name: fields.name,
    mobile: fields.mobile,
    email: fields.email,
    reason: fields.reason,
    message: fields.message,
  }).select().single();
}

export async function fetchMySupportRequests(userId) {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from("support_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return error ? [] : data || [];
}
