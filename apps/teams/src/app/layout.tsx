import './globals.css';
import { Inter } from 'next/font/google';
import NextAuthProvider from '@/app/NextAuthProvider';
import { ReactNode } from 'react';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`inter.className`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
