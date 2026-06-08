"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginActionState } from "./actions";
import { cn } from "@/lib/utils";

const initialState: LoginActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-brand-yellow px-4 py-2.5 text-sm font-medium text-brand-gray-900 shadow-soft transition hover:bg-brand-yellow-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-brand-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={cn(
            "w-full rounded-md border bg-brand-white px-3 py-2 text-sm outline-none transition",
            "border-brand-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30",
            state.fieldErrors?.email && "border-red-400 focus:border-red-400 focus:ring-red-200",
          )}
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-brand-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={cn(
            "w-full rounded-md border bg-brand-white px-3 py-2 text-sm outline-none transition",
            "border-brand-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30",
            state.fieldErrors?.password &&
              "border-red-400 focus:border-red-400 focus:ring-red-200",
          )}
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-red-600">{state.fieldErrors.password}</p>
        )}
      </div>

      {state.error && !state.fieldErrors && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
