import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow/40 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-yellow text-brand-gray-900 shadow-soft hover:bg-brand-yellow-hover",
        secondary:
          "border border-brand-gray-200 bg-brand-white text-brand-gray-700 hover:bg-brand-gray-50",
        ghost: "text-brand-gray-700 hover:bg-brand-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
        link: "text-brand-gray-700 underline-offset-2 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
