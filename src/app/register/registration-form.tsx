"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerParticipant, type RegistrationActionState } from "./actions";

const initialState: RegistrationActionState = { status: "idle" };

const inputClass = "mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20";

export function RegistrationForm() {
  const [state, formAction, pending] = useActionState(registerParticipant, initialState);

  if (state.status === "success") {
    return (
      <section className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-7 text-center">
        <p className="text-sm font-semibold tracking-[0.18em] text-cyan-200">SEAT CONFIRMED</p>
        <h2 className="mt-3 text-3xl font-bold text-white">Welcome to NOVICIA.</h2>
        <p className="mt-3 text-slate-200">{state.message}</p>
        <p className="mt-6 text-sm text-slate-300">Participant ID</p>
        <p className="mt-1 font-mono text-2xl font-bold text-cyan-200">{state.participantCode}</p>
        <p className="mt-6 text-sm leading-6 text-slate-300">Open your pass now and keep its link safe. It will also be sent through the official IEDC email service once that connection is active.</p>
        {state.passToken && <Link className="mt-6 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200" href={`/pass/${state.passToken}`}>View pass</Link>}
      </section>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <fieldset disabled={pending} className="space-y-6 disabled:cursor-wait disabled:opacity-60">
        <div className="grid gap-5 sm:grid-cols-2">
          <Label name="fullName" label="Full name" placeholder="Your full name" />
          <Label name="admissionNumber" label="Admission number" placeholder="e.g. LBS24CS001" />
          <Label name="department" label="Department" placeholder="Your department" />
          <Label name="collegeEmail" label="College email" placeholder="you@college.edu" type="email" />
          <Label name="phone" label="Phone number" placeholder="Your phone number" type="tel" />
          <Label name="emergencyContactName" label="Emergency contact name" placeholder="Parent or guardian" />
          <Label name="emergencyContactPhone" label="Emergency contact phone" placeholder="Emergency phone number" type="tel" />
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <label className="flex cursor-pointer items-start gap-3">
            <input className="mt-1 size-4 accent-cyan-300" type="checkbox" name="overnightConsent" required />
            <span>I consent to participate in NOVICIA&apos;s overnight event on 26–27 September 2026.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input className="mt-1 size-4 accent-cyan-300" type="checkbox" name="photoConsent" />
            <span>I consent to photography and media use for the event. <span className="text-slate-400">Optional.</span></span>
          </label>
        </div>
      </fieldset>

      {state.status === "error" && <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100" role="alert">{state.message}</p>}

      <button type="submit" disabled={pending} className="w-full rounded-xl bg-cyan-300 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:bg-cyan-300/50">
        {pending ? "Confirming your seat…" : "Confirm my seat"}
      </button>
      <p className="text-center text-xs leading-5 text-slate-400">First come, first served. Registration closes automatically once all 30 seats are confirmed.</p>
    </form>
  );
}

function Label({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder: string; type?: string }) {
  return <label className="block text-sm font-medium text-slate-200">{label}<input className={inputClass} name={name} type={type} placeholder={placeholder} required /></label>;
}
