import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "../globals.css";
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { AdminAuthProvider } from '../../contexts/AdminAuthContext';
import AdminProtection from '../../components/admin/AdminProtection';

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RitZone Admin Panel - Dashboard",
  description: "Professional admin panel for RitZone eCommerce platform",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.variable} ${sourceCodePro.variable} antialiased bg-gray-50`}>
        <AdminAuthProvider>
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
        </AdminAuthProvider>
      </body>
    </html>
  );
}