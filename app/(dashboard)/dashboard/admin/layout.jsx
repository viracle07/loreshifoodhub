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
          {children}
        </main>
      </div>
    </div>
  );
}