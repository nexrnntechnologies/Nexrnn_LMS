import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { COMMUNITIES } from "../data/mockData";

const demoPosts = [
  { id: "demo-post-1", title: "Welcome to the community", body: "Share your questions, work and wins with the Nexrnn learning community.", created_at: new Date().toISOString() },
];

export async function fetchCommunities(userId) {
  if (!isSupabaseConfigured) {
    return COMMUNITIES.map((community) => ({ ...community, isJoined: true, description: "Learn, ask questions and get updates from the Nexrnn team." }));
  }

  const { data: communities, error } = await supabase
    .from("communities")
    .select("id, name, description, course_id, courses(title)")
    .order("created_at", { ascending: false });
  if (error) return [];

  const [{ data: memberships }, postCounts] = await Promise.all([
    userId ? supabase.from("community_members").select("community_id").eq("user_id", userId) : Promise.resolve({ data: [] }),
    Promise.all((communities || []).map(async (community) => {
      const { count } = await supabase
        .from("community_posts")
        .select("id", { count: "exact", head: true })
        .eq("community_id", community.id);
      return [community.id, count || 0];
    })),
  ]);

  const joinedIds = new Set((memberships || []).map((membership) => membership.community_id));
  const counts = Object.fromEntries(postCounts);
  return (communities || []).map((community) => ({
    ...community,
    courseTitle: community.courses?.title || "Nexrnn Community",
    posts: counts[community.id] || 0,
    isJoined: joinedIds.has(community.id),
  }));
}

export async function fetchMyCommunities(courseIds) {
  if (!isSupabaseConfigured) return COMMUNITIES;
  if (!courseIds?.length) return [];
  const { data, error } = await supabase
    .from("communities")
    .select("id, name, description, course_id")
    .in("course_id", courseIds);
  if (error) return [];
  return data || [];
}

export async function joinCommunity(userId, communityId) {
  if (!isSupabaseConfigured) return { error: null };
  return supabase.from("community_members").upsert(
    { user_id: userId, community_id: communityId },
    { onConflict: "community_id,user_id", ignoreDuplicates: true }
  );
}

export async function leaveCommunity(userId, communityId) {
  if (!isSupabaseConfigured) return { error: null };
  return supabase.from("community_members").delete().eq("user_id", userId).eq("community_id", communityId);
}

export async function fetchCommunityPosts(communityId) {
  if (!isSupabaseConfigured) return demoPosts;
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}
