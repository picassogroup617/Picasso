"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import {
  changeOwnPasswordSchema,
  updateOwnProfileSchema,
} from "@/domain/schemas/user";
import { fieldErrorsFromZod } from "@/lib/zod-errors";
import { toSafeMessage } from "@/lib/safe-error";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateOwnProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await requireUser();

  const parsed = updateOwnProfileSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await getContainer().userService.updateOwnProfile(me.id, parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to update profile.") };
  }

  revalidatePath("/picassoadd/profile");
  return { ok: true };
}

export async function changeOwnPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const me = await requireUser();

  const parsed = changeOwnPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await getContainer().userService.changeOwnPassword(me.id, parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to change password.") };
  }

  return { ok: true };
}
