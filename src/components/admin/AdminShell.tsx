import Link from "next/link";
import type { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { SignOutButton } from "./SignOutButton";
import { Badge } from "@/components/ui/Badge";
import type { Role } from "@/domain/entities/role";

interface AdminShellProps {
  user: { name: string; email: string; role: Role };
  children: ReactNode;
}

const ROLE_TONES: Record<Role, "yellow" | "blue" | "gray"> = {
  ADMIN: "yellow",
  EDITOR: "blue",
  VIEWER: "gray",
};

export function AdminShell({ user, children }: AdminShellProps) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Picasso";

  return (
    <div className="flex min-h-screen bg-brand-gray-50">
      <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-brand-gray-200 bg-brand-white">
        <div className="border-b border-brand-gray-100 px-4 py-4">
          <Link href="/picassoadd/dashboard" className="block">
            <span className="font-display text-lg font-semibold tracking-tight text-brand-gray-900">
              {siteName}
            </span>
            <span className="ml-1 text-xs text-brand-gray-500">admin</span>
          </Link>
        </div>

        <SidebarNav role={user.role} />

        <div className="mt-auto border-t border-brand-gray-100 p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium text-brand-gray-900">
              {user.name}
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-brand-gray-500">
              <span className="truncate">{user.email}</span>
            </p>
            <div className="mt-1.5">
              <Badge tone={ROLE_TONES[user.role]}>{user.role}</Badge>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
