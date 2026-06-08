"use client";

import { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { QuoteRequestModal } from "./QuoteRequestModal";

interface QuoteRequestButtonProps extends Omit<ButtonProps, "onClick"> {
  productId?: string;
  productName?: string;
  children?: ReactNode;
}

/**
 * Renders a trigger button that opens the quote-request modal. Optional
 * `productId` is forwarded into the form as a hidden field.
 */
export function QuoteRequestButton({
  productId,
  productName,
  children = "Get a quote",
  ...buttonProps
}: QuoteRequestButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <QuoteRequestModal
        open={open}
        onClose={() => setOpen(false)}
        productId={productId}
        productName={productName}
      />
    </>
  );
}
