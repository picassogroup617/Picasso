import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-md border px-3 py-2 text-sm", {
  variants: {
    tone: {
      error: "border-red-200 bg-red-50 text-red-700",
      success: "border-emerald-200 bg-emerald-50 text-emerald-700",
      info: "border-sky-200 bg-sky-50 text-sky-700",
      warning: "border-amber-200 bg-amber-50 text-amber-800",
    },
  },
  defaultVariants: { tone: "info" },
});

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, tone, role = "alert", ...props }: AlertProps) {
  return <div role={role} className={cn(alertVariants({ tone }), className)} {...props} />;
}
