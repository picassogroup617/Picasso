import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border bg-brand-white px-3 text-sm text-brand-gray-900 outline-none transition placeholder:text-brand-gray-500",
        "border-brand-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30",
        invalid && "border-red-400 focus:border-red-400 focus:ring-red-200",
        "disabled:cursor-not-allowed disabled:bg-brand-gray-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
