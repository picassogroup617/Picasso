import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border bg-brand-white px-3 text-sm text-brand-gray-900 outline-none transition",
        "border-brand-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30",
        invalid && "border-red-400 focus:border-red-400 focus:ring-red-200",
        "disabled:cursor-not-allowed disabled:bg-brand-gray-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
