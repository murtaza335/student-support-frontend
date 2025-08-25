import type { Metadata } from 'next';
import Navbar from './_components/navbar';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import { TRPCReactProvider } from '~/trpc/react';
import '~/styles/globals.css';
import { ToastProvider } from './_components/ToastProvider';
import Footer from './_components/footer/footer';
import Sidebar from './_components/Sidebar';
import { SocketProvider } from './_components/NotificationProvider';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NUST ICT SUPPORT SYSTEM',
  description: 'NUST ICT Support Complaint System – A streamlined platform for students, faculty, and staff to submit, track, and resolve ICT-related issues efficiently. Fast complaint submission, real-time updates, and role-based access ensure transparent communication and quicker resolutions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <TRPCReactProvider>
            {/* ✅ SocketProvider here so Navbar, Sidebar, pages all get real-time updates */}
            <ToastProvider>
            <SocketProvider>
              
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="mt-16 flex-1 overflow-x-hidden">
                      <div className="md:ml-16">{children}</div>
                      <Analytics />
                    </main>
                  </div>
                </div>
                <Footer />
              
            </SocketProvider>
            </ToastProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
