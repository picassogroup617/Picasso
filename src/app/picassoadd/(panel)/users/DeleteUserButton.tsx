"use client";

import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { deleteUserAction } from "./actions";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  return (
    <ConfirmButton
      size="sm"
      variant="danger"
      confirmMessage={`Delete user "${userName}"? This cannot be undone.`}
      action={() => deleteUserAction(userId)}
    >
      Delete
    </ConfirmButton>
  );
}
