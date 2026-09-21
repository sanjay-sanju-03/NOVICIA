"use client";
import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, {} as LoginState);
  return <form action={formAction} className="mt-8 space-y-5">
    <label className="block text-sm font-medium text-slate-200">Email<input required name="email" type="email" className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300" /></label>
    <label className="block text-sm font-medium text-slate-200">Password<input required name="password" type="password" className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300" /></label>
    {state.error && <p role="alert" className="rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{state.error}</p>}
    <button disabled={pending} className="w-full rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-60">{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
