import { requireAdmin } from "@/lib/admin";
import { AttendanceConsole } from "./attendance-console";

export default async function AttendancePage() {
  const admin = await requireAdmin();
  if (!admin) return null;
  const allowed = admin.role === "SUPER_ADMIN" || admin.role === "CHECKIN_ADMIN";
  return <section className="mx-auto max-w-2xl px-5 py-8"><p className="text-xs font-bold tracking-[.2em] text-cyan-200">EVENT-DAY OPERATIONS</p><h1 className="mt-2 text-3xl font-bold">Attendance</h1>{allowed ? <AttendanceConsole /> : <p className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">Your role can view event information but cannot record attendance.</p>}</section>;
}
