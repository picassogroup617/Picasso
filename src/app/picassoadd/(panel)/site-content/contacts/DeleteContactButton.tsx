"use client";

import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { deleteContactAction } from "./actions";

export function DeleteContactButton({ id, label }: { id: string; label: string }) {
  return (
    <ConfirmButton
      size="sm"
      variant="danger"
      confirmMessage={`Delete "${label}"?`}
      action={() => deleteContactAction(id)}
    >
      Delete
    </ConfirmButton>
  );
}
