"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Role } from "@/domain/entities/role";
import type { ActionState } from "./actions";

type UserFormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

interface UserFormProps {
  mode: "create" | "edit";
  action: UserFormAction;
  defaults?: {
    name?: string;
    email?: string;
    role?: Role;
    isActive?: boolean;
  };
  /** Disable role/active editing for self-edits when applicable. */
  lockSelfFields?: boolean;
}

const ROLE_OPTIONS: Role[] = [Role.ADMIN, Role.EDITOR, Role.VIEWER];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function UserForm({ mode, action, defaults, lockSelfFields }: UserFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { ok: false });
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && mode === "edit" && <Alert tone="success">Changes saved.</Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaults?.name}
          invalid={Boolean(fe.name)}
          required
        />
        {fe.name && <p className="text-xs text-red-600">{fe.name}</p>}
      </div>

      {mode === "create" && (
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaults?.email}
            invalid={Boolean(fe.email)}
            required
          />
          {fe.email && <p className="text-xs text-red-600">{fe.email}</p>}
        </div>
      )}

      {mode === "create" && (
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            invalid={Boolean(fe.password)}
            required
          />
          <p className="text-xs text-brand-gray-500">Minimum 8 characters.</p>
          {fe.password && <p className="text-xs text-red-600">{fe.password}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <Select
          id="role"
          name="role"
          defaultValue={defaults?.role ?? Role.VIEWER}
          invalid={Boolean(fe.role)}
          disabled={lockSelfFields}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
        {fe.role && <p className="text-xs text-red-600">{fe.role}</p>}
      </div>

      {mode === "edit" && (
        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={defaults?.isActive ?? true}
            disabled={lockSelfFields}
            className="h-4 w-4 rounded border-brand-gray-300 text-brand-yellow focus:ring-brand-yellow/40"
          />
          <Label htmlFor="isActive" className="!font-normal">
            Active
          </Label>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <SubmitButton label={mode === "create" ? "Create user" : "Save changes"} />
      </div>
    </form>
  );
}
