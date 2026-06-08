"use client";

import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { deleteQuoteAction } from "./actions";

export function DeleteQuoteButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmButton
      size="sm"
      variant="danger"
      confirmMessage={`Delete quote from "${name}"? This cannot be undone.`}
      action={() => deleteQuoteAction(id)}
    >
      Delete
    </ConfirmButton>
  );
}
