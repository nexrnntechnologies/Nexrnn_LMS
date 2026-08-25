import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { COURSES, MODULES } from "../data/mockData";

// Maps DB icon name strings back to the lucide-react components already
// used by the frontend, since icons can't be stored directly in Postgres.
import { Sparkles, Megaphone, BrainCircuit, BookOpen } from "lucide-react";
const ICONS = {
  sparkles: Sparkles,
  megaphone: Megaphone,
  "brain-circuit": BrainCircuit,
  "book-open": BookOpen,
};

function mapDbCourse(row) {
  return {
    id: row.id,
    icon: ICONS[row.icon] || Sparkles,
    tag: row.tag,
    title: row.title,
    desc: row.description,
    duration: row.duration,
    level: row.level,
    mode: row.mode,
    projects: row.projects,
    certificate: row.certificate,
    mentorship: row.mentorship,
    price: Number(row.price),
    originalPrice: Number(row.original_price ?? row.price),
    discount: row.discount_label,
    rating: Number(row.rating),
    reviews: row.reviews,
    whatYoullLearn: row.what_you_learn || [],
    whoShouldTake: row.who_should_take || [],
    faqs: row.faqs || [],
  };
}

export async function fetchCourses() {
  if (!isSupabaseConfigured) return COURSES;
  const { data, error } = await supabase.from("courses").select("*").order("created_at");
  if (error || !data?.length) return COURSES;
  return data.map(mapDbCourse);
}

export async function fetchCourseCurriculum(courseId) {
  if (!isSupabaseConfigured) return MODULES;
  const { data: modules, error: mErr } = await supabase
    .from("modules")
    .select("id, title, position, lessons(id, title, type, duration, position, free_preview, video_url)")
    .eq("course_id", courseId)
    .order("position");
  if (mErr || !modules?.length) return MODULES;
  return modules.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: (m.lessons || [])
      .sort((a, b) => a.position - b.position)
      .map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        duration: l.duration,
        freePreview: l.free_preview,
        videoUrl: l.video_url,
        done: false,
      })),
  }));
}

export async function enrollInCourse(userId, courseId, details = {}) {
  if (!isSupabaseConfigured) return { error: null };
  return supabase.from("enrollments").insert({
    user_id: userId,
    course_id: courseId,
    full_name: details.fullName,
    mobile: details.mobile,
    email: details.email,
    payment_ref: details.paymentRef || null,
    status: details.status || "free",
  });
}

export async function fetchEnrollments(userId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("enrollments").select("course_id").eq("user_id", userId);
  if (error) return [];
  return data.map((r) => r.course_id);
}

// Fetches the signed-in user's enrolled courses with real progress
// (lessons marked done / total lessons for that course).
export async function fetchMyCourses(userId) {
  if (!isSupabaseConfigured) return [];

  try {
    const [{ data: enrollments, error: enrollError }, courses] = await Promise.all([
      supabase.from("enrollments").select("course_id").eq("user_id", userId),
      fetchCourses(),
    ]);

    if (enrollError) {
      console.error("fetchMyCourses: enrollments error", enrollError);
      return [];
    }

    const courseIds = (enrollments || []).map((e) => e.course_id);
    if (!courseIds.length) return [];

    // Two simple queries instead of one fragile embedded-table filter,
    // so a schema quirk in one doesn't silently break the whole page.
    const { data: modules } = await supabase
      .from("modules")
      .select("id, course_id")
      .in("course_id", courseIds);

    const moduleIds = (modules || []).map((m) => m.id);
    const moduleCourseMap = Object.fromEntries((modules || []).map((m) => [m.id, m.course_id]));

    let lessons = [];
    if (moduleIds.length) {
      const { data } = await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds);
      lessons = data || [];
    }

    let doneLessonIds = new Set();
    const lessonIds = lessons.map((l) => l.id);
    if (lessonIds.length) {
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("done", true)
        .in("lesson_id", lessonIds);
      doneLessonIds = new Set((progress || []).map((p) => p.lesson_id));
    }

    return courseIds
      .map((id) => {
        const course = courses.find((c) => c.id === id);
        if (!course) return null;
        const courseLessons = lessons.filter((l) => moduleCourseMap[l.module_id] === id);
        const total = courseLessons.length;
        const done = courseLessons.filter((l) => doneLessonIds.has(l.id)).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return { ...course, progress: pct };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("fetchMyCourses failed", err);
    return [];
  }
}

export async function submitRating(userId, courseId, stars, comment) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  return supabase
    .from("course_ratings")
    .upsert({ user_id: userId, course_id: courseId, stars, comment }, { onConflict: "user_id,course_id" });
}

export async function markLessonDone(userId, lessonId) {
  if (!isSupabaseConfigured) return { error: null };
  return supabase
    .from("lesson_progress")
    .upsert({ user_id: userId, lesson_id: lessonId, done: true }, { onConflict: "user_id,lesson_id" });
}

// Curriculum for a course, with each lesson's `done` flag filled in for the
// given user (used by the course player, which needs live progress).
export async function fetchCourseCurriculumWithProgress(courseId, userId) {
  const curriculum = await fetchCourseCurriculum(courseId);
  if (!isSupabaseConfigured || !userId) return curriculum;

  const lessonIds = curriculum.flatMap((m) => m.lessons.map((l) => l.id));
  if (!lessonIds.length) return curriculum;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("done", true)
    .in("lesson_id", lessonIds);

  const doneIds = new Set((progress || []).map((p) => p.lesson_id));
  return curriculum.map((m) => ({
    ...m,
    lessons: m.lessons.map((l) => ({ ...l, done: doneIds.has(l.id) })),
  }));
}
