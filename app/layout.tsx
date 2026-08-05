import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Formatiq — Free Browser-Based Developer Tools',
  description:
    'Free formatters, converters, validators, and generators for developers. Everything runs in your browser — nothing you paste is ever uploaded.',
  metadataBase: new URL('https://formatiq.tools'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
