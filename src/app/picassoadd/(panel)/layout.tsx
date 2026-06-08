import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/auth-guards";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
