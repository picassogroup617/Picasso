"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { contactPersonSchema } from "@/domain/schemas/contact";
import { fieldErrorsFromZod } from "@/lib/zod-errors";
import { toSafeMessage } from "@/lib/safe-error";
import { revalidatePublicLayoutPaths } from "@/lib/revalidate";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseForm(formData: FormData) {
  return contactPersonSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone1: formData.get("phone1"),
    phone1OnWhatsapp: formData.get("phone1OnWhatsapp") === "on",
    phone2: formData.get("phone2"),
    phone2OnWhatsapp: formData.get("phone2OnWhatsapp") === "on",
    order: formData.get("order"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createContactAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireWriter();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await getContainer().contactPersonService.create(parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to create.") };
  }

  revalidatePath("/picassoadd/site-content/contacts");
  revalidatePublicLayoutPaths();
  redirect("/picassoadd/site-content/contacts");
}

export async function updateContactAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireWriter();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await getContainer().contactPersonService.update(id, parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to update.") };
  }

  revalidatePath("/picassoadd/site-content/contacts");
  revalidatePublicLayoutPaths();
  return { ok: true };
}

export async function deleteContactAction(id: string): Promise<void> {
  await requireWriter();
  try {
    await getContainer().contactPersonService.delete(id);
  } catch (err) {
    const msg = toSafeMessage(err, "Failed to delete.");
    redirect(`/picassoadd/site-content/contacts?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/picassoadd/site-content/contacts");
  revalidatePublicLayoutPaths();
  redirect("/picassoadd/site-content/contacts");
}
