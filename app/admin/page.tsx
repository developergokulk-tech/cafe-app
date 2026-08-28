import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin Panel — Rest In Peace Cafe",
  description: "Manage orders, table status, products, and view trending insights for Rest In Peace Cafe.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
