/**
 * Abstraction over a remote image storage provider (Cloudinary, S3, etc.).
 * Application services depend on this — not on Cloudinary directly.
 */
export interface IImageStorage {
  /** Removes an asset by its provider-specific public identifier. No-op if missing. */
  delete(publicId: string): Promise<void>;
}
