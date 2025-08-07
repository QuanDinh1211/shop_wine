"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

// Component client để kiểm tra đường dẫn và quyết định hiển thị Header
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Header />}
      {children}
    </>
  );
}
