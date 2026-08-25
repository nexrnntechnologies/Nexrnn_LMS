import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { COMMUNITIES } from "../data/mockData";

export async function fetchMyCommunities(courseIds) {
  if (!isSupabaseConfigured) return COMMUNITIES;
  if (!courseIds?.length) return [];
  const { data, error } = await supabase
    .from("communities")
    .select("id, name, description, course_id")
    .in("course_id", courseIds);
  if (error) return [];
  return data.map((c) => ({ id: c.id, name: c.name, posts: 0 }));
}

export async function fetchCommunityPosts(communityId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}
