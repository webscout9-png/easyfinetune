import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyFineTune — One-Click LLM Fine-Tuning",
  description:
    "Upload a dataset, pick an open-source model, and fine-tune it in one click. No scripts, no infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
