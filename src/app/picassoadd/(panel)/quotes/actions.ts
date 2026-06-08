"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { updateQuoteStatusSchema } from "@/domain/schemas/quote";
import { toSafeMessage } from "@/lib/safe-error";

export type ActionState = {
  ok: boolean;
  error?: string;
};

/**
 * Updates a quote's status. Returns an `ActionState` so the calling client
 * component can surface success/failure inline instead of fire-and-forget.
 */
export async function updateQuoteStatusAction(
  id: string,
  formData: FormData,
): Promise<ActionState> {
  await requireWriter();

  const parsed = updateQuoteStatusSchema.safeParse({
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid status." };
  }

  try {
    await getContainer().quoteService.updateStatus(id, parsed.data.status);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to update.") };
  }

  revalidatePath("/picassoadd/quotes");
  revalidatePath("/picassoadd/dashboard");
  return { ok: true };
}

export async function deleteQuoteAction(id: string): Promise<void> {
  await requireWriter();
  try {
    await getContainer().quoteService.delete(id);
  } catch (err) {
    const msg = toSafeMessage(err, "Failed to delete.");
    redirect(`/picassoadd/quotes?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/picassoadd/quotes");
  revalidatePath("/picassoadd/dashboard");
  redirect("/picassoadd/quotes");
}
