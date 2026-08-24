import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { INITIAL_NOTIFICATIONS } from "../data/mockData";

export async function fetchNotifications(userId) {
  if (!isSupabaseConfigured) return INITIAL_NOTIFICATIONS;
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return INITIAL_NOTIFICATIONS;
  return data.map((n) => ({ ...n, time: new Date(n.created_at).toLocaleDateString() }));
}

export async function markNotificationsRead(userId, ids) {
  if (!isSupabaseConfigured) return { error: null };
  let query = supabase.from("notifications").update({ read: true }).eq("user_id", userId);
  if (ids?.length) query = query.in("id", ids);
  return query;
}

export async function fetchProfile(userId) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return data;
}

export async function updateProfile(userId, fields) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("profiles").update(fields).eq("id", userId);
}
