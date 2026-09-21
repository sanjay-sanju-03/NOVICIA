"use client";

import { useEffect, useState } from "react";

const start = new Date("2026-09-26T16:00:00+05:30").getTime();
const end = new Date("2026-09-27T08:00:00+05:30").getTime();
type Counter = { label: string; value: string };

function getCounter(): { state: string; values: Counter[] } {
  const now = Date.now();
  if (now >= end) return { state: "NOVICIA 2026 HAS ENDED", values: [] };
  const difference = Math.max((now < start ? start : end) - now, 0);
  const seconds = Math.floor(difference / 1000);
  const values = [["DAYS", Math.floor(seconds / 86400)], ["HRS", Math.floor((seconds % 86400) / 3600)], ["MIN", Math.floor((seconds % 3600) / 60)], ["SEC", seconds % 60]].map(([label, value]) => ({ label: String(label), value: String(value).padStart(2, "0") }));
  return { state: now < start ? "COUNTDOWN TO NOVICIA" : "NOVICIA IS LIVE", values };
}

export function EventCountdown() {
  const [counter, setCounter] = useState<{ state: string; values: Counter[] } | null>(null);
  useEffect(() => { const update = () => setCounter(getCounter()); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, []);
  if (!counter) return <div className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/5" />;
  return <div className="rounded-2xl border border-cyan-200/20 bg-[#050817]/70 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur"><p className="text-center text-[.68rem] font-bold tracking-[.2em] text-cyan-200">{counter.state}</p>{counter.values.length > 0 && <div className="mt-4 grid grid-cols-4 divide-x divide-white/10">{counter.values.map(({ label, value }) => <div key={label} className="text-center"><p className="font-mono text-2xl font-bold sm:text-3xl">{value}</p><p className="mt-1 text-[.6rem] font-bold tracking-[.16em] text-slate-400">{label}</p></div>)}</div>}</div>;
}
