import type { Metadata } from 'next';
import { Inter, Montserrat, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'MyTraks',
  description: 'A modern, premium, secure tracker for job, university, and project applications with real-time statistics and notification logs.',
};

import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", montserrat.variable, "font-sans", geist.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              localStorage.removeItem('theme');
              document.documentElement.classList.remove('dark');
            } catch (e) {}
          })();
        `}} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
