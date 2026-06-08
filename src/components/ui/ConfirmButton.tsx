"use client";

import { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";

interface ConfirmButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  /** Action to run after the user confirms. Typically a server action. */
  action: () => void | Promise<void>;
  /** Confirmation prompt shown via window.confirm. */
  confirmMessage: string;
  children: ReactNode;
}

/**
 * Minimal confirm-then-action button. Uses native confirm() to avoid a modal
 * dependency at this phase; can be swapped for a polished modal in Phase 6.
 */
export function ConfirmButton({
  action,
  confirmMessage,
  children,
  disabled,
  ...rest
}: ConfirmButtonProps) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      {...rest}
      disabled={disabled || pending}
      onClick={async () => {
        if (!window.confirm(confirmMessage)) return;
        try {
          setPending(true);
          await action();
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "Working…" : children}
    </Button>
  );
}
