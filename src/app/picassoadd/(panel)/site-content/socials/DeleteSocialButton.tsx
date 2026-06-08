"use client";

import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { deleteSocialAction } from "./actions";

export function DeleteSocialButton({ id, label }: { id: string; label: string }) {
  return (
    <ConfirmButton
      size="sm"
      variant="danger"
      confirmMessage={`Delete "${label}"?`}
      action={() => deleteSocialAction(id)}
    >
      Delete
    </ConfirmButton>
  );
}
