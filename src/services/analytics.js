import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const VISITOR_KEY = "nexrnn_visitor_id";
const SESSION_KEY = "nexrnn_visit_session_id";

function randomId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getStorageId(storage, key, prefix) {
  try {
    let value = storage.getItem(key);
    if (!value) {
      value = randomId(prefix);
      storage.setItem(key, value);
    }
    return value;
  } catch {
    return randomId(prefix);
  }
}

export async function trackPageVisit(pathname) {
  if (!isSupabaseConfigured || !pathname || pathname.startsWith("/nexrnn/master_nexrnn/admin")) return;
  const path = pathname.split("?")[0];
  const visitedKey = `nexrnn_visited_${path}`;
  try {
    if (sessionStorage.getItem(visitedKey)) return;
    sessionStorage.setItem(visitedKey, "1");
  } catch {
    // Continue without client-side de-duplication if storage is unavailable.
  }

  const visitorId = getStorageId(localStorage, VISITOR_KEY, "visitor");
  const sessionId = getStorageId(sessionStorage, SESSION_KEY, "session");
  await supabase.from("site_visits").insert({ visitor_id: visitorId, session_id: sessionId, path });
}
