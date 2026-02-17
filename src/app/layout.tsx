import type { Metadata } from 'next';
import { Inter, Oswald, Roboto_Condensed } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });
const roboto = Roboto_Condensed({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-roboto' });


export const metadata: Metadata = {
  title: 'World Wrestling Avatars',
  description: 'The ultimate wrestling avatar portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${oswald.variable} ${roboto.variable} font-sans bg-black text-neutral-200 min-h-screen flex flex-col`}>
        <AuthProvider>
          <DataProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
