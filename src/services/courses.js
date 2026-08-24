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
    .select("id, title, position, lessons(id, title, type, duration, position, free_preview)")
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
        done: false,
      })),
  }));
}

export async function enrollInCourse(userId, courseId) {
  if (!isSupabaseConfigured) return { error: null };
  return supabase.from("enrollments").insert({ user_id: userId, course_id: courseId });
}

export async function fetchEnrollments(userId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("enrollments").select("course_id").eq("user_id", userId);
  if (error) return [];
  return data.map((r) => r.course_id);
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
