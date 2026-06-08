"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { productSchema } from "@/domain/schemas/product";
import { fieldErrorsFromZod } from "@/lib/zod-errors";
import { toSafeMessage } from "@/lib/safe-error";
import { revalidatePublicProductPaths } from "@/lib/revalidate";

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseForm(formData: FormData) {
  return productSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    longDescription: formData.get("longDescription"),
    slug: formData.get("slug"),
    order: formData.get("order"),
    isPublished: formData.get("isPublished") === "on",
    images: formData.get("images") ?? "",
  });
}

export async function createProductAction(
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
    await getContainer().productService.create(parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to create.") };
  }

  revalidatePath("/picassoadd/products");
  revalidatePublicProductPaths();
  redirect("/picassoadd/products");
}

export async function updateProductAction(
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
    await getContainer().productService.update(id, parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Failed to update.") };
  }

  revalidatePath("/picassoadd/products");
  revalidatePath(`/picassoadd/products/${id}`);
  revalidatePublicProductPaths();
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<void> {
  await requireWriter();
  try {
    await getContainer().productService.delete(id);
  } catch (err) {
    const msg = toSafeMessage(err, "Failed to delete.");
    redirect(`/picassoadd/products?error=${encodeURIComponent(msg)}`);
  }
  revalidatePath("/picassoadd/products");
  revalidatePublicProductPaths();
  redirect("/picassoadd/products");
}
