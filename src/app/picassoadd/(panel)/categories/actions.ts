"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { categorySchema } from "@/domain/schemas/category";
import { fieldErrorsFromZod } from "@/lib/zod-errors";
import { toSafeMessage } from "@/lib/safe-error";
import { revalidatePublicCategoryPaths } from "@/lib/revalidate";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription"),
    slug: formData.get("slug"),
    imageUrl: formData.get("imageUrl"),
    imagePublicId: formData.get("imagePublicId"),
    order: formData.get("order"),
    isPublished: formData.get("isPublished") === "on",
  });
}

export async function createCategoryAction(
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
    await getContainer().categoryService.create(parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to create.") };
  }

  revalidatePath("/picassoadd/categories");
  revalidatePublicCategoryPaths();
  redirect("/picassoadd/categories");
}

export async function updateCategoryAction(
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
    await getContainer().categoryService.update(id, parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to update.") };
  }

  revalidatePath("/picassoadd/categories");
  revalidatePath(`/picassoadd/categories/${id}`);
  revalidatePublicCategoryPaths();
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireWriter();
  try {
    await getContainer().categoryService.delete(id);
  } catch (err) {
    const msg = toSafeMessage(err, "Failed to delete.");
    redirect(`/picassoadd/categories?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/picassoadd/categories");
  revalidatePublicCategoryPaths();
  redirect("/picassoadd/categories");
}
