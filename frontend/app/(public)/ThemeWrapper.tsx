'use client';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"      // Tailwind dark mode
      defaultTheme="light"   // fallback server
      enableSystem
      enableColorScheme={false} // jangan ubah style color-scheme di <html>
    >
      <div className="min-h-screen">
        {children}
      </div>
    </ThemeProvider>
  );
}
