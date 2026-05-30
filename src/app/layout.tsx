import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Axis - Everything is one",
  description:
    "Axis is a connected operational ecosystem unifying people, tools, and workflows with calm, intentional clarity.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased font-sans`}>{children}</body>
    </html>
  );
}
