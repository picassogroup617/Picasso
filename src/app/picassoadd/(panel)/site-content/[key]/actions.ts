"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { upsertSiteContentSchema } from "@/domain/schemas/siteContent";
import { fieldErrorsFromZod } from "@/lib/zod-errors";
import { toSafeMessage } from "@/lib/safe-error";
import { revalidatePublicLayoutPaths } from "@/lib/revalidate";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function saveSiteContentAction(
  key: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireWriter();

  const parsed = upsertSiteContentSchema.safeParse({
    key,
    title: formData.get("title"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    imagePublicId: formData.get("imagePublicId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await getContainer().siteContentService.upsert(parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to save section.") };
  }

  revalidatePath("/picassoadd/site-content");
  revalidatePath(`/picassoadd/site-content/${key}`);
  revalidatePublicLayoutPaths();
  return { ok: true };
}
