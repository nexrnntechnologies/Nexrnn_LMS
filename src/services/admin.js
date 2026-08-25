import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export async function adminFetchCourses() {
  if (!isSupabaseConfigured) return { data: [], error: { message: "Supabase not configured yet." } };
  const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminCreateCourse(course) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("courses").insert(course);
}

export async function adminUpdateCourse(id, fields) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("courses").update(fields).eq("id", id);
}

export async function adminDeleteCourse(id) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("courses").delete().eq("id", id);
}

export async function adminFetchUsers() {
  if (!isSupabaseConfigured) return { data: [], error: { message: "Supabase not configured yet." } };
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, created_at")
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminFetchEnrollmentCounts() {
  if (!isSupabaseConfigured) return { data: [], error: { message: "Supabase not configured yet." } };
  const { data, error } = await supabase.from("enrollments").select("course_id");
  return { data: data || [], error };
}

// ---------------------------------------------------------
// Course content: modules & lessons
// ---------------------------------------------------------
export async function adminFetchModules(courseId) {
  if (!isSupabaseConfigured) return { data: [], error: { message: "Supabase not configured yet." } };
  const { data, error } = await supabase
    .from("modules")
    .select("id, title, position, lessons(id, title, type, duration, position, free_preview, video_url)")
    .eq("course_id", courseId)
    .order("position");
  if (error) return { data: [], error };
  const sorted = (data || []).map((m) => ({
    ...m,
    lessons: (m.lessons || []).sort((a, b) => a.position - b.position),
  }));
  return { data: sorted, error: null };
}

export async function adminCreateModule(courseId, title, position) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  const id = `${courseId}-m${Date.now()}`;
  return supabase.from("modules").insert({ id, course_id: courseId, title, position });
}

export async function adminUpdateModule(id, fields) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("modules").update(fields).eq("id", id);
}

export async function adminDeleteModule(id) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("modules").delete().eq("id", id);
}

export async function adminCreateLesson(moduleId, lesson) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  const id = `${moduleId}-l${Date.now()}`;
  return supabase.from("lessons").insert({
    id,
    module_id: moduleId,
    title: lesson.title,
    type: lesson.type,
    duration: lesson.duration,
    video_url: lesson.videoUrl,
    free_preview: lesson.freePreview,
    position: lesson.position || 0,
  });
}

export async function adminUpdateLesson(id, fields) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("lessons").update(fields).eq("id", id);
}

export async function adminDeleteLesson(id) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("lessons").delete().eq("id", id);
}

// ---------------------------------------------------------
// User detail: enrollments + progress for one user
// ---------------------------------------------------------
export async function adminFetchUserDetail(userId) {
  if (!isSupabaseConfigured) return { profile: null, enrollments: [] };

  const [{ data: profile }, { data: enrollments }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("enrollments").select("*, courses(title, id)").eq("user_id", userId),
  ]);

  const withProgress = await Promise.all(
    (enrollments || []).map(async (e) => {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, modules!inner(course_id)")
        .eq("modules.course_id", e.course_id);
      const lessonIds = (lessons || []).map((l) => l.id);
      let done = 0;
      if (lessonIds.length) {
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", userId)
          .eq("done", true)
          .in("lesson_id", lessonIds);
        done = (progress || []).length;
      }
      return {
        ...e,
        courseTitle: e.courses?.title || e.course_id,
        totalLessons: lessonIds.length,
        doneLessons: done,
        pct: lessonIds.length ? Math.round((done / lessonIds.length) * 100) : 0,
      };
    })
  );

  return { profile, enrollments: withProgress };
}

// ---------------------------------------------------------
// Communities (admin-managed)
// ---------------------------------------------------------
export async function adminFetchCommunities() {
  if (!isSupabaseConfigured) return { data: [], error: { message: "Supabase not configured yet." } };
  const { data, error } = await supabase
    .from("communities")
    .select("*, courses(title)")
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminCreateCommunity(community) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("communities").insert(community);
}

export async function adminUpdateCommunity(id, fields) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("communities").update(fields).eq("id", id);
}

export async function adminDeleteCommunity(id) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase.from("communities").delete().eq("id", id);
}

export async function adminFetchCommunityPosts(communityId) {
  if (!isSupabaseConfigured) return { data: [], error: { message: "Supabase not configured yet." } };
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

// Posts an announcement to a community AND creates a notification for
// every user enrolled in the community's linked course.
export async function adminCreateCommunityPost(community, { title, body }) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };

  const { error: postError } = await supabase
    .from("community_posts")
    .insert({ community_id: community.id, title, body });
  if (postError) return { error: postError };

  if (community.course_id) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("course_id", community.course_id);
    const rows = (enrollments || []).map((e) => ({
      user_id: e.user_id,
      text: `posted in ${community.name}`,
      detail: title || body.slice(0, 80),
    }));
    if (rows.length) await supabase.from("notifications").insert(rows);
  }

  return { error: null };
}

// ---------------------------------------------------------
// Direct notification broadcast (all users, or one course's enrollees)
// ---------------------------------------------------------
export async function adminSendNotification({ audience, courseId, text, detail }) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };

  let userIds = [];
  if (audience === "all") {
    const { data } = await supabase.from("profiles").select("id");
    userIds = (data || []).map((p) => p.id);
  } else if (audience === "course" && courseId) {
    const { data } = await supabase.from("enrollments").select("user_id").eq("course_id", courseId);
    userIds = (data || []).map((e) => e.user_id);
  }

  if (!userIds.length) return { error: { message: "No matching users found." } };

  const rows = userIds.map((user_id) => ({ user_id, text, detail }));
  return supabase.from("notifications").insert(rows);
}
