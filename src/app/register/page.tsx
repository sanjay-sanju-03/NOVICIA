import Link from "next/link";
import { RegistrationForm } from "./registration-form";
import { getRegistrationStatus } from "@/lib/registration";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const status = await getRegistrationStatus();
  const registrationClosed = !status.isOpen || status.confirmedCount >= status.capacity;

  return (
    <main className="min-h-screen bg-[#070a1a] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold tracking-[0.15em] text-cyan-200">← NOVICIA 2026</Link>
        <p className="mt-12 text-sm font-semibold tracking-[0.2em] text-violet-300">BEGIN. EXPLORE. BECOME.</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Reserve your NOVICIA seat.</h1>
        <p className="mt-4 max-w-xl leading-7 text-slate-300">26–27 September 2026 · ASAP OpenMind, Kasaragod · For LBSCEK first-year students.</p>

        <div className="my-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <span className="font-medium text-slate-200">Confirmed seats</span>
          <span className="font-mono text-xl font-bold text-cyan-200">{status.configured ? `${status.confirmedCount} / ${status.capacity}` : "Opening soon"}</span>
        </div>

        {registrationClosed ? (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-7 text-center">
            <p className="text-sm font-semibold tracking-[0.18em] text-violet-300">REGISTRATION CLOSED</p>
            <h2 className="mt-3 text-2xl font-bold">All 30 seats have been filled.</h2>
            <p className="mt-3 text-slate-300">Thank you for your interest in NOVICIA 2026.</p>
          </section>
        ) : <RegistrationForm />}
      </div>
    </main>
  );
}
