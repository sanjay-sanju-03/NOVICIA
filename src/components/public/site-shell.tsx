import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  ["About", "/about"], ["Schedule", "/schedule"], ["Activities", "/activities"], ["Speakers", "/speakers"], ["Venue", "/venue"], ["FAQ", "/faq"],
] as const;

export function SiteHeader() {
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070a1a]/85 px-5 py-4 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5"><Link href="/" className="font-black tracking-[.18em] text-cyan-200">NOVICIA ’26</Link><nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm text-slate-300 lg:flex">{links.map(([label, href]) => <Link key={href} className="transition hover:text-cyan-200" href={href}>{label}</Link>)}<Link className="transition hover:text-cyan-200" href="/announcements">Live</Link></nav><div className="flex items-center gap-3"><Link href="/register" className="rounded-lg bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200">Register</Link><details className="relative lg:hidden"><summary className="list-none rounded-lg border border-white/20 px-3 py-2 text-sm font-bold text-white">Menu</summary><nav aria-label="Mobile navigation" className="absolute right-0 mt-3 grid w-48 overflow-hidden rounded-xl border border-white/10 bg-[#10142d] p-2 shadow-2xl">{links.map(([label, href]) => <Link key={href} className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10" href={href}>{label}</Link>)}<Link className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10" href="/announcements">Live announcements</Link><Link className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10" href="/admin/login">Organizer login</Link></nav></details></div></div></header>;
}

export function SiteFooter() {
  return <footer className="border-t border-white/10 bg-[#050714] px-6 py-9 text-sm text-slate-400"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row"><p>IEDC LBSCEK · NOVICIA 2026</p><p>Begin. Explore. Become.</p></div></footer>;
}

export function PublicPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <main className="min-h-screen bg-[#070a1a] text-white"><SiteHeader /><section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24"><p className="text-sm font-bold tracking-[.2em] text-cyan-200">{eyebrow}</p><h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-.05em] sm:text-7xl">{title}</h1><div className="mt-12">{children}</div></section><SiteFooter /></main>;
}
