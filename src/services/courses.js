import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { COURSES, WORKSHOPS, MODULES, CURRICULUM_BY_COURSE, INITIAL_LEARNER_FEEDBACK } from "../data/mockData";
import { Sparkles, Megaphone, BrainCircuit, BookOpen } from "lucide-react";

const ICONS = {
  sparkles: Sparkles,
  megaphone: Megaphone,
  "brain-circuit": BrainCircuit,
  "book-open": BookOpen,
};

function mapDbCourse(row) {
  return {
    ...row,
    courseType: row.course_type || "course",
    id: row.id,
    icon: ICONS[row.icon] || Sparkles,
    tag: row.tag,
    title: row.title,
    desc: row.description,
    duration: row.duration,
    level: row.level,
    mode: row.mode,
    projects: Number(row.projects || 0),
    certificate: row.certificate !== false,
    courseComplete: row.course_complete === true,
    mentorship: Boolean(row.mentorship),
    price: Number(row.price || 0),
    originalPrice: Number(row.original_price ?? row.price ?? 0),
    discount: row.discount_label,
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    demoVideoUrl: row.demo_video_url || "",
    whatYoullLearn: row.what_you_learn || [],
    whoShouldTake: row.who_should_take || [],
    faqs: row.faqs || [],
  };
}

function mapLesson(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    duration: row.duration,
    freePreview: Boolean(row.free_preview),
    videoUrl: row.video_url || "",
    pdfUrl: row.pdf_url || "",
    content: row.content || "",
    done: false,
    resources: (row.lesson_resources || []).sort((a, b) => a.position - b.position).map((resource) => ({
      id: resource.id,
      label: resource.label,
      url: resource.url,
    })),
  };
}

export async function fetchCourses(courseType = null) {
  if (!isSupabaseConfigured) {
    const catalog = [...COURSES, ...WORKSHOPS];
    return courseType ? catalog.filter((course) => course.courseType === courseType) : catalog;
  }
  let query = supabase.from("courses").select("*").order("created_at");
  if (courseType) query = query.eq("course_type", courseType);
  const { data, error } = await query;
  if (error) {
    console.error("fetchCourses failed", error);
    // Existing installations may not have migration_16 yet. Keep legacy courses visible
    // while the admin applies the discriminator migration; workshops simply return empty.
    if (courseType) {
      const { data: legacyData } = await supabase.from("courses").select("*").order("created_at");
      const mapped = (legacyData || []).map(mapDbCourse);
      return mapped.filter((course) => course.courseType === courseType);
    }
    return [];
  }
  return (data || []).map(mapDbCourse);
}

export async function fetchCourseCurriculum(courseId) {
  if (!isSupabaseConfigured) return CURRICULUM_BY_COURSE[courseId] || MODULES;
  const { data: modules, error } = await supabase
    .from("modules")
    .select("id, title, position, lessons(id, title, type, duration, position, free_preview, video_url, pdf_url, content, lesson_resources(id, label, url, position))")
    .eq("course_id", courseId)
    .order("position");
  if (error) {
    console.error("fetchCourseCurriculum failed", error);
    return [];
  }
  return (modules || []).map((module) => ({
    id: module.id,
    title: module.title,
    lessons: (module.lessons || []).sort((a, b) => a.position - b.position).map(mapLesson),
  }));
}

export async function enrollInCourse(userId, courseId, details = {}) {
  if (!isSupabaseConfigured) return { error: null };
  return supabase.from("enrollments").upsert({
    user_id: userId,
    course_id: courseId,
    full_name: details.fullName,
    mobile: details.mobile,
    email: details.email,
    payment_ref: details.paymentRef || null,
    status: details.status || "free",
  }, { onConflict: "user_id,course_id", ignoreDuplicates: true });
}

export async function fetchEnrollments(userId) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("enrollments").select("course_id").eq("user_id", userId);
  if (error) return [];
  return (data || []).map((row) => row.course_id);
}

export async function fetchMyCourses(userId) {
  if (!isSupabaseConfigured) return [];

  try {
    const [{ data: enrollments, error: enrollError }, courses] = await Promise.all([
      supabase.from("enrollments").select("course_id").eq("user_id", userId),
      fetchCourses(),
    ]);

    if (enrollError) {
      console.error("fetchMyCourses enrollments error", enrollError);
      return [];
    }

    const courseIds = (enrollments || []).map((enrollment) => enrollment.course_id);
    if (!courseIds.length) return [];

    const { data: modules } = await supabase.from("modules").select("id, course_id").in("course_id", courseIds);
    const moduleIds = (modules || []).map((module) => module.id);
    const moduleCourseMap = Object.fromEntries((modules || []).map((module) => [module.id, module.course_id]));

    let lessons = [];
    if (moduleIds.length) {
      const { data } = await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds);
      lessons = data || [];
    }

    let doneLessonIds = new Set();
    const lessonIds = lessons.map((lesson) => lesson.id);
    if (lessonIds.length) {
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("done", true)
        .in("lesson_id", lessonIds);
      doneLessonIds = new Set((progress || []).map((item) => item.lesson_id));
    }

    return courseIds.map((id) => {
      const course = courses.find((item) => item.id === id);
      if (!course) return null;
      const courseLessons = lessons.filter((lesson) => moduleCourseMap[lesson.module_id] === id);
      const total = courseLessons.length;
      const done = courseLessons.filter((lesson) => doneLessonIds.has(lesson.id)).length;
      return { ...course, progress: total ? Math.round((done / total) * 100) : 0 };
    }).filter(Boolean);
  } catch (error) {
    console.error("fetchMyCourses failed", error);
    return [];
  }
}

export function getDemoCourseRatings() {
  try {
    const saved = JSON.parse(localStorage.getItem("nexrnn_demo_feedback") || "[]");
    const savedKeys = new Set(saved.map((rating) => `${rating.user_id}:${rating.course_id}`));
    return [...saved, ...INITIAL_LEARNER_FEEDBACK.filter((rating) => !savedKeys.has(`${rating.user_id}:${rating.course_id}`))];
  } catch {
    return INITIAL_LEARNER_FEEDBACK;
  }
}

export async function fetchCourseRatings() {
  if (!isSupabaseConfigured) return getDemoCourseRatings();
  const { data, error } = await supabase
    .from("course_ratings")
    .select("id, user_id, course_id, learner_name, stars, comment, created_at, courses(title)")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data || []).map((rating) => ({
    ...rating,
    courseTitle: rating.courses?.title || rating.course_id,
  }));
}

export async function submitRating(userId, courseId, stars, comment, learnerName = null) {
  if (!isSupabaseConfigured) return { error: { message: "Supabase not configured yet." } };
  const { data: existing, error: lookupError } = await supabase
    .from("course_ratings")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (lookupError) return { error: lookupError };
  if (existing) return { error: { message: "You have already rated this course. Each course can be rated only once." } };
  return supabase.from("course_ratings").insert({ user_id: userId, course_id: courseId, learner_name: learnerName, stars, comment });
}

export async function markLessonDone(userId, lessonId) {
  if (!isSupabaseConfigured) return { error: null };
  return supabase.from("lesson_progress").upsert(
    { user_id: userId, lesson_id: lessonId, done: true, updated_at: new Date().toISOString() },
    { onConflict: "user_id,lesson_id" }
  );
}

export async function fetchCourseCurriculumWithProgress(courseId, userId) {
  const curriculum = await fetchCourseCurriculum(courseId);
  if (!isSupabaseConfigured || !userId) return curriculum;

  const lessonIds = curriculum.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  if (!lessonIds.length) return curriculum;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("done", true)
    .in("lesson_id", lessonIds);
  const doneIds = new Set((progress || []).map((item) => item.lesson_id));
  return curriculum.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({ ...lesson, done: doneIds.has(lesson.id) })),
  }));
}
