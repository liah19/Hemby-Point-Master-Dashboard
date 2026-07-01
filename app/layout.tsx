import './globals.css';
import AuthProvider from './components/SessionProvider';
import Script from 'next/script';
import React from 'react';

export const metadata = {
  title: 'Hemby Point Sanctuary - Personal Life Dashboard',
  description: 'A serene and grounding SaaS workspace to align your life goals, track daily habits, connect your schedule, and wake up to personalized morning text briefings.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-navy antialiased selection:bg-sage/20 selection:text-navy">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      </body>
    </html>
  );
}
