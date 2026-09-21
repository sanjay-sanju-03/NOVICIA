import Link from "next/link";

const stages = ["DISCOVER", "CONNECT", "LEARN", "PLAY", "BUILD", "REFLECT"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070a1a] text-white">
      <div className="absolute inset-x-0 top-0 -z-0 h-[38rem] bg-[radial-gradient(circle_at_50%_0%,rgba(92,47,225,.38),transparent_58%)]" />
      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-7 sm:px-10">
        <header className="flex items-center justify-between">
          <p className="font-bold tracking-[.22em] text-cyan-200">NOVICIA 2026</p>
          <Link href="/admin/login" className="text-sm text-slate-300 transition hover:text-white">Organizer login</Link>
        </header>

        <div className="flex flex-1 flex-col justify-center py-20">
          <p className="text-sm font-bold tracking-[.24em] text-violet-300">IEDC LBSCEK PRESENTS</p>
          <h1 className="mt-6 max-w-4xl text-6xl font-black leading-[.9] tracking-[-.06em] sm:text-8xl lg:text-9xl">BEGIN.<br /><span className="text-cyan-200">EXPLORE.</span><br />BECOME.</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">An overnight first-year experience built for new connections, new skills, and the confidence to begin.</p>
          <div className="mt-9 flex flex-wrap gap-3 text-sm text-slate-200"><span className="rounded-full border border-white/15 px-4 py-2">26–27 September 2026</span><span className="rounded-full border border-white/15 px-4 py-2">ASAP OpenMind, Kasaragod</span></div>
          <div className="mt-10 flex flex-wrap gap-4"><Link href="/register" className="rounded-xl bg-cyan-300 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-200">Register for NOVICIA</Link><a href="#experience" className="rounded-xl border border-white/20 px-6 py-3.5 font-semibold transition hover:bg-white/10">Explore the experience</a></div>
        </div>

        <div className="border-t border-white/10 py-6"><div className="flex items-center justify-between text-xs font-bold tracking-[.16em] text-slate-400"><span>4 PM · BEGIN</span><span>MIDNIGHT · EXPERIENCE</span><span>8 AM · DAWN</span></div></div>
      </section>

      <section id="experience" className="relative z-10 border-t border-white/10 bg-[#0a1024] px-6 py-20 sm:px-10"><div className="mx-auto max-w-6xl"><p className="text-sm font-bold tracking-[.2em] text-cyan-200">THE EXPERIENCE</p><h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">One night. The start of something bigger.</h2><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stages.map((stage, index) => <article key={stage} className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><p className="font-mono text-sm text-violet-300">0{index + 1}</p><h3 className="mt-8 text-2xl font-bold">{stage}</h3></article>)}</div></div></section>

      <section className="relative z-10 px-6 py-20 text-center sm:px-10"><p className="text-sm font-bold tracking-[.2em] text-violet-300">30 SEATS ONLY · FIRST COME, FIRST SERVED</p><h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Your journey starts here.</h2><Link href="/register" className="mt-8 inline-flex rounded-xl bg-cyan-300 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-200">Reserve your seat</Link></section>
    </main>
  );
}
