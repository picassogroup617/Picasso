"use client";

import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { deleteCategoryAction } from "./actions";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmButton
      size="sm"
      variant="danger"
      confirmMessage={`Delete category "${name}"? This cannot be undone.`}
      action={() => deleteCategoryAction(id)}
    >
      Delete
    </ConfirmButton>
  );
}
