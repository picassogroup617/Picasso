"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import {
  adminResetPasswordSchema,
  createUserSchema,
  updateUserSchema,
} from "@/domain/schemas/user";
import { fieldErrorsFromZod } from "@/lib/zod-errors";
import { toSafeMessage } from "@/lib/safe-error";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await getContainer().userService.create(parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to create user.") };
  }

  revalidatePath("/picassoadd/users");
  redirect("/picassoadd/users");
}

export async function updateUserAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await getContainer().userService.update(id, me.id, parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to update user.") };
  }

  revalidatePath("/picassoadd/users");
  revalidatePath(`/picassoadd/users/${id}`);
  return { ok: true };
}

export async function resetUserPasswordAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = adminResetPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await getContainer().userService.resetPassword(id, parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to reset password.") };
  }

  return { ok: true };
}

export async function deleteUserAction(id: string): Promise<void> {
  const me = await requireAdmin();
  try {
    await getContainer().userService.delete(id, me.id);
  } catch (err) {
    // For now, surface delete errors via redirect query param (simpler than toast plumbing).
    const msg = toSafeMessage(err, "Failed to delete user.");
    redirect(`/picassoadd/users?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/picassoadd/users");
  redirect("/picassoadd/users");
}
