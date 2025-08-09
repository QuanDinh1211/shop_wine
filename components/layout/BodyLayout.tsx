"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import ClientLayout from "@/components/layout/ClientLayout";

export default function BodyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <ClientLayout>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        {!isAdminPage && <Footer />}
      </div>
      <Toaster />
    </ClientLayout>
  );
}
