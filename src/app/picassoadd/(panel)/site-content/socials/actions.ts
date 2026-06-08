"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { socialLinkSchema } from "@/domain/schemas/contact";
import { fieldErrorsFromZod } from "@/lib/zod-errors";
import { toSafeMessage } from "@/lib/safe-error";
import { revalidatePublicLayoutPaths } from "@/lib/revalidate";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseForm(formData: FormData) {
  return socialLinkSchema.safeParse({
    platform: formData.get("platform"),
    label: formData.get("label"),
    url: formData.get("url"),
    order: formData.get("order"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createSocialAction(
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
    await getContainer().socialLinkService.create(parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to create.") };
  }

  revalidatePath("/picassoadd/site-content/socials");
  revalidatePublicLayoutPaths();
  redirect("/picassoadd/site-content/socials");
}

export async function updateSocialAction(
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
    await getContainer().socialLinkService.update(id, parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to update.") };
  }

  revalidatePath("/picassoadd/site-content/socials");
  revalidatePublicLayoutPaths();
  return { ok: true };
}

export async function deleteSocialAction(id: string): Promise<void> {
  await requireWriter();
  try {
    await getContainer().socialLinkService.delete(id);
  } catch (err) {
    const msg = toSafeMessage(err, "Failed to delete.");
    redirect(`/picassoadd/site-content/socials?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/picassoadd/site-content/socials");
  revalidatePublicLayoutPaths();
  redirect("/picassoadd/site-content/socials");
}
