"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import {
  changeOwnPasswordAction,
  updateOwnProfileAction,
  type ActionState,
} from "./actions";

function SaveButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function ProfileNameForm({ defaultName }: { defaultName: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateOwnProfileAction,
    { ok: false },
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && <Alert tone="success">Profile updated.</Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultName}
          invalid={Boolean(fe.name)}
          required
        />
        {fe.name && <p className="text-xs text-red-600">{fe.name}</p>}
      </div>

      <SaveButton label="Save" pendingLabel="Saving…" />
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    changeOwnPasswordAction,
    { ok: false },
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && <Alert tone="success">Password changed.</Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          invalid={Boolean(fe.currentPassword)}
          required
        />
        {fe.currentPassword && (
          <p className="text-xs text-red-600">{fe.currentPassword}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          minLength={8}
          invalid={Boolean(fe.newPassword)}
          required
        />
        {fe.newPassword && <p className="text-xs text-red-600">{fe.newPassword}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          invalid={Boolean(fe.confirmPassword)}
          required
        />
        {fe.confirmPassword && (
          <p className="text-xs text-red-600">{fe.confirmPassword}</p>
        )}
      </div>

      <SaveButton label="Change password" pendingLabel="Updating…" />
    </form>
  );
}
