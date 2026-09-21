"use client";
import { useEffect, useRef, useState } from "react";

type Detector = { detect(source: ImageBitmapSource): Promise<{ rawValue: string }[]> };
type DetectorConstructor = new (options: { formats: string[] }) => Detector;

export function CameraScanner({ onToken }: { onToken: (token: string) => void }) {
  const video = useRef<HTMLVideoElement>(null); const [message, setMessage] = useState("Start the camera to scan a NOVICIA pass.");
  useEffect(() => () => { if (video.current?.srcObject) (video.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop()); }, []);
  async function start() {
    const BarcodeDetector = (window as unknown as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
    if (!BarcodeDetector || !navigator.mediaDevices?.getUserMedia) { setMessage("Camera scanning is unavailable in this browser. Use manual token entry."); return; }
    try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); if (!video.current) return; video.current.srcObject = stream; await video.current.play(); const detector = new BarcodeDetector({ formats: ["qr_code"] }); const scan = async () => { if (!video.current?.srcObject) return; const codes = await detector.detect(video.current); const value = codes[0]?.rawValue; const token = value?.match(/\/pass\/([a-f0-9]{64})$/i)?.[1]; if (token) { onToken(token); stream.getTracks().forEach((track) => track.stop()); setMessage("Pass detected. Submit attendance below."); return; } requestAnimationFrame(scan); }; requestAnimationFrame(scan); setMessage("Scanning…"); } catch { setMessage("Camera permission was unavailable. Use manual token entry."); }
  }
  return <div className="rounded-2xl border border-dashed border-cyan-200/30 bg-slate-950 p-4"><video ref={video} className="aspect-video w-full rounded-xl bg-black" muted playsInline /><button type="button" onClick={start} className="mt-4 rounded-xl border border-cyan-200/35 px-4 py-2 font-semibold text-cyan-100">Start camera</button><p className="mt-3 text-sm text-slate-400">{message}</p></div>;
}
