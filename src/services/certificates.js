import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { getCertificateId, getCertificateRegistrationId } from "../lib/certificates.js";
import { COURSES, WORKSHOPS } from "../data/mockData";

export async function fetchMyCertificates(userId) {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase.from("certificates").select("*").eq("user_id", userId).order("issued_at", { ascending: false });
  return error ? [] : data || [];
}

export async function issueCertificate(userId, courseId, details = {}) {
  if (!isSupabaseConfigured || !userId) return { data: null, error: null };
  if (details.courseComplete !== true) {
    return { data: null, error: { message: "This course is still ongoing. The certificate will be available after the admin marks the course complete." } };
  }
  const { data: rpcData, error: rpcError } = await supabase.rpc("issue_certificate", { p_course_id: courseId });
  const issued = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!rpcError && issued) return { data: issued, error: null };

  // Compatibility fallback for projects where migration_9/10/14 has not yet
  // recreated the RPC. The page only calls this after all lessons are done
  // and the admin has marked the course complete.
  // It never updates an existing certificate, preserving its ID and date.
  const { data: existing, error: lookupError } = await supabase.from("certificates").select("*").eq("user_id", userId).eq("course_id", courseId).maybeSingle();
  if (lookupError) return { data: null, error: rpcError || lookupError };
  if (existing) return { data: existing, error: null };
  const certificateId = getCertificateId(userId, courseId);
  const payload = {
    registration_id: certificateId,
    certificate_id: certificateId,
    user_id: userId,
    course_id: courseId,
    certificate_type: details.courseType === "workshop" ? "Workshop" : "Course",
    student_name: details.studentName || "Nexrnn Learner",
    course_title: details.courseTitle || courseId,
  };
  const { data: inserted, error: insertError } = await supabase.from("certificates").insert(payload).select("*").single();
  if (!insertError) return { data: inserted, error: null };
  if (/certificate_id|column/i.test(insertError.message || "")) {
    const legacyPayload = { registration_id: certificateId, user_id: userId, course_id: courseId, student_name: payload.student_name, course_title: payload.course_title };
    const { data: legacyInserted, error: legacyError } = await supabase.from("certificates").insert(legacyPayload).select("*").single();
    if (!legacyError) return { data: legacyInserted, error: null };
  }
  return { data: null, error: rpcError || insertError };
}

function stableDemoIssueDate(userId, courseId) {
  const storageKey = `nexrnn:certificate:issued:${userId}:${courseId}`;
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const created = new Date().toISOString();
    window.localStorage.setItem(storageKey, created);
    return created;
  } catch {
    return "2026-01-01T00:00:00.000Z";
  }
}

export function demoCertificateFor(course, studentName = "Student Name", userId = "demo-user") {
  const certificateId = getCertificateRegistrationId(userId, course.id);
  return {
    registration_id: certificateId,
    certificate_id: certificateId,
    user_id: "demo-user",
    course_id: course.id,
    certificate_type: course.courseType === "workshop" ? "Workshop" : "Course",
    student_name: studentName,
    course_title: course.title,
    issued_at: stableDemoIssueDate(userId, course.id),
  };
}

export async function verifyCertificate(registrationId) {
  const normalized = registrationId.trim().toUpperCase();
  if (!normalized) return { data: null, error: { message: "Enter a registration ID." } };
  if (!isSupabaseConfigured) {
    // Demo mode has no database, so verify the same stable IDs used by the
    // demo certificate cards. Include every seeded course so old shared demo
    // links remain valid after a refresh.
    const demoCourse = [...COURSES, ...WORKSHOPS].find((course) => getCertificateRegistrationId("demo-user", course.id) === normalized);
    return demoCourse
      ? { data: demoCertificateFor(demoCourse), error: null }
      : { data: null, error: null };
  }
  const { data: byCertificateId, error: certificateError } = await supabase.from("certificates").select("certificate_id, registration_id, certificate_type, student_name, course_title, course_id, issued_at").eq("certificate_id", normalized).maybeSingle();
  if (byCertificateId) return { data: byCertificateId, error: null };
  const { data: byLegacyId, error: legacyError } = await supabase.from("certificates").select("registration_id, certificate_type, student_name, course_title, course_id, issued_at").eq("registration_id", normalized).maybeSingle();
  return { data: byLegacyId, error: legacyError || (certificateError && !byLegacyId ? certificateError : null) };
}
