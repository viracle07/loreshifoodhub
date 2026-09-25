import AdminInstall from "@/components/admin/AdminInstall";
import AdminNotifications from "@/components/admin/AdminNotifications";
import DiscountControl from "@/components/admin/DiscountControl";
import { adminMetadata } from "@/lib/admin-metadata";
export const metadata = adminMetadata;
export const viewport = { themeColor: "#68912B" };

import { redirect } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { getCurrentAdmin } from "@/lib/auth/admin-auth";
export default async function AdminLayout({
  children,
}) {
  const admin =
    await getCurrentAdmin();

  if (!admin) {
    redirect(
      "/admin-login"
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      <AdminSidebar />

      <div className="lg:pl-64">
        <main className="min-h-screen">
          <div className="mx-auto max-w-7xl space-y-4 px-5 pt-20 sm:px-6 lg:px-8 lg:pt-6">
            <DiscountControl />
            <div className="grid items-start gap-4 md:grid-cols-2">
              <AdminNotifications adminId={admin.uid} />
              <AdminInstall />
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}