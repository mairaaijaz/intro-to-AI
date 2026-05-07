import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARABOT — Arabic Vocabulary HLR",
  description: "Learn 200 Arabic words using the Half-Life Regression spaced repetition model from the Duolingo paper (Settles & Meeder, ACL 2016).",
  keywords: ["Arabic", "vocabulary", "spaced repetition", "HLR", "Duolingo", "language learning"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        {children}
      </body>
    </html>
  );
}
