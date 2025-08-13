'use client';
import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "../globals.css";
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { AdminAuthProvider } from '../../contexts/AdminAuthContext';
import AdminProtection from '../../components/admin/AdminProtection';
import { usePathname } from 'next/navigation';

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    // Login page - no sidebar, header, or protection
    return <div className="min-h-screen">{children}</div>;
  }

  // Regular admin pages - with sidebar, header, and protection
  return (
    <AdminProtection>
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminProtection>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.variable} ${sourceCodePro.variable} antialiased bg-gray-50`}>
        <AdminAuthProvider>
          <AdminLayoutContent>
            {children}
          </AdminLayoutContent>
        </AdminAuthProvider>
      </body>
    </html>
  );
}