import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  if (!admin) return <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-center text-white"><p>Admin access is unavailable until Supabase is configured.</p></main>;
  return <main className="min-h-screen bg-slate-950 text-white"><header className="border-b border-white/10 px-5 py-4"><div className="mx-auto flex max-w-6xl items-center justify-between"><Link href="/admin/dashboard" className="font-bold tracking-[.16em] text-cyan-200">NOVICIA ADMIN</Link><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{admin.role.replace("_", " ")}</span></div></header><nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-5 py-4 text-sm text-slate-300"><Link href="/admin/dashboard">Dashboard</Link><Link href="/admin/attendance">Attendance</Link><Link href="/admin/participants">Participants</Link></nav>{children}</main>;
}
