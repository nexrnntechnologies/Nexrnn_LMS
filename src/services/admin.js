import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const notConfigured = () => ({ message: "Supabase not configured yet. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first." });

export async function adminFetchCourses() {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminCreateCourse(course) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("courses").insert(course);
}

export async function adminUpdateCourse(id, fields) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  const { id: ignoredId, ...safeFields } = fields;
  return supabase.from("courses").update(safeFields).eq("id", id);
}

export async function adminDeleteCourse(id) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("courses").delete().eq("id", id);
}

export async function adminFetchUsers() {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_registration_id, email, first_name, last_name, phone, city, role, created_at")
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminFetchEnrollmentCounts() {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data, error } = await supabase.from("enrollments").select("course_id");
  return { data: data || [], error };
}

export async function adminUpdateUserProfile(userId, fields) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  const allowed = ["first_name", "last_name", "email", "phone", "city", "gender", "company", "professional_title", "timezone", "avatar_url", "role"];
  const safeFields = Object.fromEntries(Object.entries(fields || {}).filter(([key]) => allowed.includes(key)));
  return supabase.from("profiles").update(safeFields).eq("id", userId);
}

export async function adminDeleteUser(userId) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.rpc("admin_delete_user", { p_user_id: userId });
}

export async function adminFetchVisitStats() {
  if (!isSupabaseConfigured) return { data: { visits: 0, visitors: 0, lastVisit: null }, error: notConfigured() };
  const { data, error } = await supabase.from("site_visits").select("visitor_id, session_id, visited_at");
  const rows = data || [];
  return {
    data: {
      visits: rows.length,
      visitors: new Set(rows.map((row) => row.visitor_id).filter(Boolean)).size,
      lastVisit: rows.map((row) => row.visited_at).filter(Boolean).sort().at(-1) || null,
    },
    error,
  };
}

export async function adminFetchCourseEnrollments() {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data: enrollments, error } = await supabase.from("enrollments").select("*").order("enrolled_at", { ascending: false });
  if (error) return { data: [], error };
  const rows = enrollments || [];
  const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];
  const courseIds = [...new Set(rows.map((row) => row.course_id).filter(Boolean))];
  const [{ data: profiles }, { data: courses }, { data: certificates }] = await Promise.all([
    userIds.length ? supabase.from("profiles").select("id, user_registration_id, email, first_name, last_name, phone").in("id", userIds) : Promise.resolve({ data: [] }),
    courseIds.length ? supabase.from("courses").select("id, title").in("id", courseIds) : Promise.resolve({ data: [] }),
    userIds.length && courseIds.length ? supabase.from("certificates").select("*").in("user_id", userIds).in("course_id", courseIds) : Promise.resolve({ data: [] }),
  ]);
  const profileMap = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]));
  const courseMap = Object.fromEntries((courses || []).map((course) => [course.id, course]));
  const certificateMap = Object.fromEntries((certificates || []).map((certificate) => [`${certificate.user_id}:${certificate.course_id}`, certificate]));
  return {
    data: rows.map((row) => ({
      ...row,
      profile: profileMap[row.user_id] || {},
      courseTitle: courseMap[row.course_id]?.title || row.course_id,
      certificate: certificateMap[`${row.user_id}:${row.course_id}`] || null,
      certificateId: certificateMap[`${row.user_id}:${row.course_id}`]?.certificate_id || certificateMap[`${row.user_id}:${row.course_id}`]?.registration_id || null,
    })),
    error: null,
  };
}

export async function adminFetchModules(courseId) {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data, error } = await supabase
    .from("modules")
    .select("id, title, position, lessons(id, title, type, duration, position, free_preview, video_url, pdf_url, content, lesson_resources(id, label, url, position))")
    .eq("course_id", courseId)
    .order("position");
  if (error) return { data: [], error };
  return {
    data: (data || []).map((module) => ({
      ...module,
      lessons: (module.lessons || []).sort((a, b) => a.position - b.position),
    })),
    error: null,
  };
}

function newId(prefix) {
  const suffix = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now();
  return `${prefix}-${suffix}`;
}

export async function uploadLessonPdf(lessonId, file) {
  if (!isSupabaseConfigured) return { url: "", error: notConfigured() };
  if (!file) return { url: "", error: null };
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name || "")) return { url: "", error: { message: "Please select a PDF file." } };
  if (file.size > 25 * 1024 * 1024) return { url: "", error: { message: "PDF must be smaller than 25 MB." } };

  const path = `${lessonId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error } = await supabase.storage.from("lesson-pdfs").upload(path, file, {
    cacheControl: "3600",
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) return { url: "", error };
  const { data } = supabase.storage.from("lesson-pdfs").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function adminCreateModule(courseId, title, position) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("modules").insert({ id: newId(`${courseId}-m`), course_id: courseId, title, position });
}

export async function adminUpdateModule(id, fields) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("modules").update(fields).eq("id", id);
}

export async function adminDeleteModule(id) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("modules").delete().eq("id", id);
}

export async function adminReplaceLessonResources(lessonId, resources = []) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  const { error: deleteError } = await supabase.from("lesson_resources").delete().eq("lesson_id", lessonId);
  if (deleteError) return { error: deleteError };
  const rows = resources
    .filter((resource) => resource?.label?.trim() && resource?.url?.trim())
    .map((resource, index) => ({ lesson_id: lessonId, label: resource.label.trim(), url: resource.url.trim(), position: index + 1 }));
  if (!rows.length) return { error: null };
  const { error } = await supabase.from("lesson_resources").insert(rows);
  return { error };
}

export async function adminCreateLesson(moduleId, lesson) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  const id = newId(`${moduleId}-l`);
  let pdfUrl = lesson.pdfUrl || null;
  if (lesson.pdfFile) {
    const uploaded = await uploadLessonPdf(id, lesson.pdfFile);
    if (uploaded.error) return { error: uploaded.error };
    pdfUrl = uploaded.url;
  }
  const { error } = await supabase.from("lessons").insert({
    id,
    module_id: moduleId,
    title: lesson.title,
    type: lesson.type,
    duration: lesson.duration || null,
    video_url: lesson.videoUrl || null,
    pdf_url: pdfUrl,
    content: lesson.content || null,
    free_preview: Boolean(lesson.freePreview),
    position: lesson.position || 0,
  });
  if (error) return { error };
  return adminReplaceLessonResources(id, lesson.resources || []);
}

export async function adminUpdateLesson(id, fields) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  const { pdfFile, pdfUrl, videoUrl, freePreview, ...rest } = fields;
  const payload = {
    ...rest,
    ...(videoUrl !== undefined ? { video_url: videoUrl || null } : {}),
    ...(freePreview !== undefined ? { free_preview: Boolean(freePreview) } : {}),
    ...(pdfUrl !== undefined ? { pdf_url: pdfUrl || null } : {}),
  };
  if (pdfFile) {
    const uploaded = await uploadLessonPdf(id, pdfFile);
    if (uploaded.error) return { error: uploaded.error };
    payload.pdf_url = uploaded.url;
  }
  return supabase.from("lessons").update(payload).eq("id", id);
}

export async function adminDeleteLesson(id) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("lessons").delete().eq("id", id);
}

export async function adminFetchUserDetail(userId) {
  if (!isSupabaseConfigured) return { profile: null, enrollments: [], certificates: [] };
  const [{ data: profile }, { data: enrollments }, { data: certificates }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("enrollments").select("*, courses(title, id)").eq("user_id", userId),
    supabase.from("certificates").select("*").eq("user_id", userId),
  ]);

  const withProgress = await Promise.all((enrollments || []).map(async (enrollment) => {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, modules!inner(course_id)")
      .eq("modules.course_id", enrollment.course_id);
    const lessonIds = (lessons || []).map((lesson) => lesson.id);
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
      ...enrollment,
      courseTitle: enrollment.courses?.title || enrollment.course_id,
      totalLessons: lessonIds.length,
      doneLessons: done,
      pct: lessonIds.length ? Math.round((done / lessonIds.length) * 100) : 0,
    };
  }));
  return { profile, enrollments: withProgress, certificates: certificates || [] };
}

export async function adminFetchCommunities() {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data, error } = await supabase.from("communities").select("*, courses(title)").order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminCreateCommunity(community) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("communities").insert(community);
}

export async function adminUpdateCommunity(id, fields) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("communities").update(fields).eq("id", id);
}

export async function adminDeleteCommunity(id) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("communities").delete().eq("id", id);
}

export async function adminFetchCommunityPosts(communityId) {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data, error } = await supabase.from("community_posts").select("*").eq("community_id", communityId).order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminUpdateCommunityPost(id, fields) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("community_posts").update(fields).eq("id", id);
}

export async function adminDeleteCommunityPost(id) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  return supabase.from("community_posts").delete().eq("id", id);
}

export async function adminCreateCommunityPost(community, { title, body, linkUrl }) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  const { error: postError } = await supabase.from("community_posts").insert({ community_id: community.id, title, body, link_url: linkUrl || null });
  if (postError) return { error: postError };

  if (community.course_id) {
    const { data: enrollments } = await supabase.from("enrollments").select("user_id").eq("course_id", community.course_id);
    const rows = (enrollments || []).map((enrollment) => ({
      user_id: enrollment.user_id,
      text: `posted in ${community.name}`,
      detail: title || body.slice(0, 80),
      link_url: linkUrl || null,
    }));
    if (rows.length) await supabase.from("notifications").insert(rows);
  }
  return { error: null };
}

export async function adminSendNotification({ audience, courseId, text, detail, linkUrl }) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  let userIds = [];
  if (audience === "all") {
    const { data } = await supabase.from("profiles").select("id");
    userIds = (data || []).map((profile) => profile.id);
  } else if (audience === "course" && courseId) {
    const { data } = await supabase.from("enrollments").select("user_id").eq("course_id", courseId);
    userIds = (data || []).map((enrollment) => enrollment.user_id);
  }
  if (!userIds.length) return { error: { message: "No matching users found." } };
  return supabase.from("notifications").insert(userIds.map((user_id) => ({ user_id, text, detail, link_url: linkUrl || null })));
}

export async function adminFetchCertificates() {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data: certificates, error } = await supabase.from("certificates").select("*").order("issued_at", { ascending: false });
  if (error) return { data: [], error };
  const rows = certificates || [];
  const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];
  const courseIds = [...new Set(rows.map((row) => row.course_id).filter(Boolean))];
  const [{ data: profiles }, { data: courses }] = await Promise.all([
    userIds.length ? supabase.from("profiles").select("id, user_registration_id, first_name, last_name, email").in("id", userIds) : Promise.resolve({ data: [] }),
    courseIds.length ? supabase.from("courses").select("id, title").in("id", courseIds) : Promise.resolve({ data: [] }),
  ]);
  const profileMap = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]));
  const courseMap = Object.fromEntries((courses || []).map((course) => [course.id, course]));
  return { data: rows.map((row) => ({ ...row, profile: profileMap[row.user_id] || {}, courseTitle: courseMap[row.course_id]?.title || row.course_id })), error: null };
}

export async function adminFetchCourseFeedback() {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data, error } = await supabase
    .from("course_ratings")
    .select("id, user_id, course_id, stars, comment, created_at, courses(title)")
    .order("created_at", { ascending: false });
  return {
    data: (data || []).map((rating) => ({ ...rating, courseTitle: rating.courses?.title || rating.course_id })),
    error,
  };
}

export async function adminFetchSupportRequests() {
  if (!isSupabaseConfigured) return { data: [], error: notConfigured() };
  const { data, error } = await supabase.from("support_requests").select("*").order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminUpdateSupportRequest(id, fields) {
  if (!isSupabaseConfigured) return { error: notConfigured() };
  const { data, error } = await supabase.from("support_requests").update(fields).eq("id", id).select("user_id").single();
  if (error) return { error };
  if (fields.admin_feedback && data?.user_id) {
    await supabase.from("notifications").insert({
      user_id: data.user_id,
      text: "replied to your support request",
      detail: fields.admin_feedback,
      link_url: "/support",
    });
  }
  return { data, error: null };
}
