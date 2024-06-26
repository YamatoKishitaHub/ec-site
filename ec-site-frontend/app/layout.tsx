import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header/Header';
import Footer from '@/components/layout/footer/Footer';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
const metadata: Metadata = {
  title: 'KISHIYAMA.COM',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/icon.ico" type="image/x-icon" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="my-6">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
};
