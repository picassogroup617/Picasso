"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Package,
  FileText,
  Mail,
  UserCog,
} from "lucide-react";
import type { Role } from "@/domain/entities/role";
import { cn } from "@/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  /** Roles allowed to see this item. Empty/undefined = all roles. */
  allow?: Role[];
}

const NAV: NavItem[] = [
  { href: "/picassoadd/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/picassoadd/categories", label: "Categories", icon: FolderTree },
  { href: "/picassoadd/products", label: "Products", icon: Package },
  { href: "/picassoadd/quotes", label: "Quote Requests", icon: Mail },
  { href: "/picassoadd/site-content", label: "Site Content", icon: FileText },
  { href: "/picassoadd/users", label: "Users", icon: Users, allow: ["ADMIN"] },
  { href: "/picassoadd/profile", label: "My Profile", icon: UserCog },
];

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
      {NAV.filter((item) => !item.allow || item.allow.includes(role)).map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
              active
                ? "bg-brand-yellow-soft font-medium text-brand-gray-900"
                : "text-brand-gray-700 hover:bg-brand-gray-100",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
