"use server";
import { getServerSupabase } from "@/lib/supabase/server";

export type AttendanceState = { kind: "idle" | "success" | "warning" | "error"; message?: string; code?: string; name?: string; department?: string; recordedAt?: string };

export async function recordAttendance(_: AttendanceState, formData: FormData): Promise<AttendanceState> {
  const token = String(formData.get("token") ?? "").trim();
  const mode = String(formData.get("mode") ?? "CHECK_IN");
  if (!/^[a-f0-9]{64}$/i.test(token)) return { kind: "error", message: "This QR code is not a valid NOVICIA pass." };
  const supabase = await getServerSupabase();
  if (!supabase) return { kind: "error", message: "Attendance is being configured." };
  const { data, error } = await supabase.rpc("record_attendance", { p_pass_token: token, p_mode: mode });
  if (error || !data?.[0]) {
    await supabase.rpc("log_attendance_rejection", { p_reason: error?.message ?? "UNKNOWN", p_token_suffix: token });
    return { kind: "error", message: error?.message.includes("INVALID_PASS") ? "Invalid NOVICIA pass." : "Attendance could not be recorded." };
  }
  const result = data[0];
  const duplicate = String(result.outcome).startsWith("ALREADY_");
  return { kind: duplicate ? "warning" : "success", message: duplicate ? String(result.outcome).replaceAll("_", " ") : String(result.outcome).replaceAll("_", " "), code: result.participant_code, name: result.full_name, department: result.department, recordedAt: result.recorded_at };
}
