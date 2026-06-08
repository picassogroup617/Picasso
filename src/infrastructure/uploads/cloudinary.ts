import { v2 as cloudinary } from "cloudinary";
import type { IImageStorage } from "@/domain/interfaces/IImageStorage";

/** Reads Cloudinary credentials from env. Throws if any are missing. */
function readCloudinaryEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "picasso";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local.",
    );
  }
  return { cloudName, apiKey, apiSecret, folder };
}

let configured = false;
function configureCloudinary() {
  if (configured) return readCloudinaryEnv();
  const env = readCloudinaryEnv();
  cloudinary.config({
    cloud_name: env.cloudName,
    api_key: env.apiKey,
    api_secret: env.apiSecret,
    secure: true,
  });
  configured = true;
  return env;
}

/** Whitelisted upload formats; matches the picker `accept="image/*"` filter. */
const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif" as const;

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  /** Echoed by the client as the upload `resource_type` segment. */
  resourceType: "image";
  /** Echoed by the client as the `allowed_formats` form field. */
  allowedFormats: string;
}

/**
 * Mints a short-lived signature so the browser can upload directly to Cloudinary.
 * The signed parameter set constrains the upload to image assets in known
 * formats, in the configured folder. The client MUST echo every signed value
 * back to Cloudinary unchanged — any divergence invalidates the signature.
 */
export function signUpload(subfolder?: string): SignedUploadParams {
  const env = configureCloudinary();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = subfolder ? `${env.folder}/${subfolder}` : env.folder;

  const signedParams = {
    timestamp,
    folder,
    allowed_formats: ALLOWED_FORMATS,
  };
  const signature = cloudinary.utils.api_sign_request(
    signedParams,
    env.apiSecret,
  );

  return {
    cloudName: env.cloudName,
    apiKey: env.apiKey,
    timestamp,
    folder,
    signature,
    resourceType: "image",
    allowedFormats: ALLOWED_FORMATS,
  };
}

/** Best-effort deletion of an uploaded asset. Swallows "not found" errors. */
export class CloudinaryImageStorage implements IImageStorage {
  async delete(publicId: string): Promise<void> {
    if (!publicId) return;
    configureCloudinary();
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true });
    } catch (err) {
      console.warn(`[cloudinary] failed to delete asset ${publicId}:`, err);
    }
  }
}
