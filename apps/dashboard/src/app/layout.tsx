import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resonance Core — CI/CD Self-Healing Dashboard",
  description: "Autonomous CI/CD failure recovery agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-resonance-bg text-resonance-text font-mono">
        {children}
      </body>
    </html>
  );
}