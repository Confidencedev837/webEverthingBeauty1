import React from 'react';
import type { Metadata } from 'next';
import { fontDisplay, fontBody, fontAccent } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'About | Everything Beauty Platform',
  description: 'Learn about our on-demand verified beauty marketplace and infrastructure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontAccent.variable}`}
    >
      <body className="font-body antialiased selection:bg-[#6C35A6]/20 selection:text-[#32104D]">
        {children}
      </body>
    </html>
  );
}

