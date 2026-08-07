import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Viral Blueprint | Content Analysis for Creators',
  description: 'Viral Blueprint helps content creators evaluate and improve content before publishing. Get practical improvement blueprints based on real, explainable criteria.',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230a0f1c" width="100" height="100" rx="15"/><path d="M30 25 L30 75 L75 50 Z" fill="%238b5cf6"/><rect x="25" y="20" width="5" height="60" fill="%2306b6d4" opacity="0.5"/><rect x="35" y="15" width="5" height="70" fill="%2306b6d4" opacity="0.3"/></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
