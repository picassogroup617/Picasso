import type { IImageStorage } from "@/domain/interfaces/IImageStorage";
import type { IImageUsage } from "@/domain/interfaces/IImageUsage";

/**
 * Best-effort Cloudinary cleanup for a batch of publicIds that were just
 * detached from a row. Must be called AFTER the corresponding DB write has
 * committed, otherwise the row would still count itself as a reference.
 *
 * For each id we:
 *   1. Re-check the global reference count. If anything still points at the
 *      asset we leave it alone (#1: shared publicIds across products).
 *   2. Otherwise call the storage delete, wrapped in allSettled so a single
 *      Cloudinary failure can not crash the surrounding admin action (#2).
 *
 * Failures are logged but never rethrown — the DB is the source of truth and
 * orphaned remote assets are recoverable via Cloudinary's trash, while a
 * thrown error here would surface to the admin as a confusing post-save crash.
 */
export async function cleanupDetachedImages(
  publicIds: ReadonlyArray<string | null | undefined>,
  deps: { images: IImageStorage; imageUsage: IImageUsage },
): Promise<void> {
  const unique = Array.from(
    new Set(publicIds.filter((p): p is string => Boolean(p))),
  );
  if (unique.length === 0) return;

  // One batched DB roundtrip instead of N parallel count queries per asset.
  const refsByPublicId = await deps.imageUsage.countReferencesMany(unique);

  const results = await Promise.allSettled(
    unique.map(async (publicId) => {
      const refs = refsByPublicId.get(publicId) ?? 0;
      if (refs > 0) return;
      await deps.images.delete(publicId);
    }),
  );

  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[image-cleanup] failed to remove asset:", r.reason);
    }
  }
}
