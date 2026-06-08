"use client";

import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { deleteProductAction } from "./actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmButton
      size="sm"
      variant="danger"
      confirmMessage={`Delete product "${name}"? This cannot be undone.`}
      action={() => deleteProductAction(id)}
    >
      Delete
    </ConfirmButton>
  );
}
