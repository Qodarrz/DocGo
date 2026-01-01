import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";
import Header from "@/app/(public)/Header";
import Footer from "@/app/(public)/Footer";
import ThemeWrapper from "@/app/(public)/ThemeWrapper";
import { FloatingChatbot } from "@/app/(public)/components/ChatBot";
import { FloatingDownload } from "@/app/(public)/components/Download";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocGo",
  description: "Healthcare Platform",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-background`}>
        <ThemeWrapper>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />

          <div className="fixed right-11 bottom-34 z-50 flex flex-col gap-4">
            <FloatingDownload />
          </div>
          <div className="fixed right-10 bottom-12 z-50">
            <FloatingChatbot />
          </div>
        </ThemeWrapper>
      </body>
    </html>
  );
}
