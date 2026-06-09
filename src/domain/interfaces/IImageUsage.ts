/**
 * Counts how many rows across the catalog still reference a given image
 * `publicId`. Used by services to make Cloudinary cleanup safe: an asset is
 * only removed from the storage provider when no remaining row points at it.
 *
 * Implementations must aggregate every table that can persist a publicId
 * (categories, product images, site content, ...) so a shared asset is never
 * deleted while still in use.
 */
export interface IImageUsage {
  countReferences(publicId: string): Promise<number>;
  /**
   * Batched form of {@link countReferences}. Returns a map keyed by publicId
   * with the aggregate reference count across every table that stores one.
   * Missing keys are treated as zero references.
   */
  countReferencesMany(publicIds: readonly string[]): Promise<Map<string, number>>;
}
