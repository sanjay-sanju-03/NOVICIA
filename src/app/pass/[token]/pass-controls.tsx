"use client";

export function PassControls() {
  return <button type="button" onClick={() => window.print()} className="print:hidden rounded-xl border border-cyan-200/50 px-5 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-200/10">Print / save pass</button>;
}
