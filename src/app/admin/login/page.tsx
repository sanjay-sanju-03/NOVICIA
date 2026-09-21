import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#070a1a] px-5 text-white"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7"><p className="text-xs font-bold tracking-[.25em] text-cyan-200">NOVICIA 2026</p><h1 className="mt-3 text-3xl font-bold">Organizer login</h1><p className="mt-2 text-sm text-slate-300">Authorized IEDC organizers only.</p><LoginForm /></section></main>;
}
