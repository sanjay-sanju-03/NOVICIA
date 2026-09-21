import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function DashboardPage() {
  const admin = await requireAdmin();
  if (!admin) return null;
  const { data } = await admin.supabase.rpc("get_admin_dashboard_stats", { p_event_slug: "novicia-2026" });
  const stats = data?.[0] ?? { capacity: 30, confirmed_count: 0, checked_in_count: 0, checked_out_count: 0 };
  const cards = [["Total capacity", stats.capacity], ["Confirmed", stats.confirmed_count], ["Checked in", stats.checked_in_count], ["Checked out", stats.checked_out_count]];
  return <section className="mx-auto max-w-6xl px-5 py-8"><h1 className="text-3xl font-bold">Event dashboard</h1><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-4xl font-bold text-cyan-200">{value}</p></div>)}</div><div className="mt-7 flex flex-wrap gap-3"><Quick href="/admin/attendance" label="Scan QR" /><Quick href="/admin/participants" label="Participants" /><Quick href="/admin/announcements" label="Announcements" /><Quick href="/admin/reports" label="Export CSV" /></div></section>;
}
function Quick({ href, label }: { href: string; label: string }) { return <Link className="rounded-xl border border-cyan-200/35 px-5 py-3 font-semibold text-cyan-100 hover:bg-cyan-200/10" href={href}>{label}</Link>; }
