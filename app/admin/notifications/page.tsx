import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Service Notifications & Waiter Calls — Rest In Peace Cafe",
  description: "Live table service calls and order alerts for Rest In Peace Cafe.",
};

export default function AdminNotificationsPage() {
  return <AdminDashboard initialTab="notifications" />;
}
