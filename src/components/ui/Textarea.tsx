import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full rounded-md border bg-brand-white px-3 py-2 text-sm text-brand-gray-900 outline-none transition placeholder:text-brand-gray-500",
        "border-brand-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30",
        invalid && "border-red-400 focus:border-red-400 focus:ring-red-200",
        "disabled:cursor-not-allowed disabled:bg-brand-gray-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
