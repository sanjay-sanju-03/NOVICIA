import { requireAdmin } from "@/lib/admin";

export default async function ParticipantsPage() {
  const admin = await requireAdmin();
  if (!admin) return null;
  if (admin.role === "CHECKIN_ADMIN") return <section className="mx-auto max-w-6xl px-5 py-8"><h1 className="text-3xl font-bold">Participants</h1><p className="mt-4 text-slate-300">Check-in organizers use the attendance search tool, which reveals only event-day information.</p></section>;
  return <section className="mx-auto max-w-6xl px-5 py-8"><h1 className="text-3xl font-bold">Participants</h1><p className="mt-4 text-slate-300">Participant management will be connected after the real Supabase database is configured.</p></section>;
}
