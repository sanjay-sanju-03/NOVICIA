/* eslint-disable @next/next/no-img-element -- QR is an in-memory data URL. */
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PassControls } from "./pass-controls";
import { getParticipantPass } from "@/lib/pass";

export const dynamic = "force-dynamic";

export default async function ParticipantPassPage({ params }: PageProps<"/pass/[token]">) {
  const { token } = await params;
  const pass = await getParticipantPass(token);
  if (!pass) notFound();

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const qrDataUrl = await QRCode.toDataURL(`${appUrl}/pass/${token}`, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 420,
    color: { dark: "#07101f", light: "#ffffff" },
  });
  const eventDate = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date(pass.startsAt));

  return (
    <main className="min-h-screen bg-[#070a1a] px-5 py-10 text-white sm:px-8 print:bg-white print:p-0 print:text-slate-950">
      <article className="mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-gradient-to-br from-[#15113b] via-[#0c1830] to-[#07101f] shadow-2xl shadow-cyan-950/40 print:max-w-none print:rounded-none print:border-0 print:bg-white print:shadow-none">
        <div className="border-b border-white/10 px-7 py-6 print:border-slate-200">
          <p className="text-xs font-bold tracking-[0.3em] text-cyan-200 print:text-cyan-700">IEDC LBSCEK PRESENTS</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">NOVICIA <span className="text-cyan-200 print:text-cyan-700">2026</span></h1>
          <p className="mt-1 text-sm font-medium text-slate-300 print:text-slate-600">BEGIN. EXPLORE. BECOME.</p>
        </div>
        <div className="space-y-7 px-7 py-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-violet-200 print:text-violet-700">PARTICIPANT</p>
            <h2 className="mt-2 text-3xl font-bold">{pass.fullName}</h2>
            <p className="mt-1 text-slate-300 print:text-slate-600">{pass.department}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-white/5 p-5 text-sm print:bg-slate-100">
            <div><dt className="text-slate-400 print:text-slate-600">Participant ID</dt><dd className="mt-1 font-mono font-bold text-cyan-200 print:text-cyan-700">{pass.participantCode}</dd></div>
            <div><dt className="text-slate-400 print:text-slate-600">Status</dt><dd className="mt-1 font-semibold">{pass.status.replace("_", " ")}</dd></div>
            <div className="col-span-2"><dt className="text-slate-400 print:text-slate-600">Event</dt><dd className="mt-1 font-semibold">{eventDate} · {pass.venueName}</dd></div>
          </dl>
          <div className="rounded-3xl bg-white p-4 text-center"><img className="mx-auto size-56" src={qrDataUrl} alt="NOVICIA check-in QR code" /><p className="mt-3 text-xs font-semibold tracking-[0.15em] text-slate-600">KEEP THIS QR READY FOR CHECK-IN</p></div>
          <p className="text-center text-sm text-slate-300 print:text-slate-600">This pass is personal. Do not share its link or QR code.</p>
          <div className="flex justify-center"><PassControls /></div>
        </div>
      </article>
    </main>
  );
}
