import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOVICIA 2026 | Begin. Explore. Become.",
  description: "NOVICIA 2026, the overnight first-year experience by IEDC LBSCEK.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
