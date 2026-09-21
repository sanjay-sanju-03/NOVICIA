"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => { const update = () => setProgress((window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)) * 100); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  return <div className="fixed inset-x-0 top-0 z-50 h-1 bg-white/5"><div className="h-full bg-gradient-to-r from-violet-500 via-cyan-300 to-amber-300" style={{ width: `${progress}%` }} /></div>;
}
