import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ROLES_WRITE } from "@/domain/entities/role";
import { signUpload } from "@/infrastructure/uploads/cloudinary";
import { getClientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";
import { toSafeMessage } from "@/lib/safe-error";

/** Per-user signature mint budget. Generous enough for bulk product uploads
 *  but tight enough to make scripted abuse pointless. */
const SIGNATURE_RATE_LIMIT = 60;
const SIGNATURE_RATE_WINDOW_MS = 60_000;

/**
 * POST /api/uploads/cloudinary/signature
 *
 * Body: { folder?: string }
 * Returns: { cloudName, apiKey, timestamp, folder, signature, resourceType, allowedFormats }
 *
 * Restricted to ADMIN / EDITOR and rate-limited per user (with the client IP
 * mixed in as a secondary key so a single compromised cookie cannot mint
 * unlimited signatures from a botnet).
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !ROLES_WRITE.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = await getClientIp();
  const limit = rateLimiter.check(
    `cloudinary-sig:${session.user.id}:${ip}`,
    SIGNATURE_RATE_LIMIT,
    SIGNATURE_RATE_WINDOW_MS,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many upload requests. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) },
      },
    );
  }

  let subfolder: string | undefined;
  try {
    const body = (await req.json().catch(() => ({}))) as { folder?: unknown };
    if (typeof body.folder === "string") {
      // Accept simple slugs only: a-z, 0-9, dash, underscore, slash.
      if (/^[a-z0-9_\-\/]{1,64}$/i.test(body.folder)) {
        subfolder = body.folder;
      }
    }
  } catch {
    // ignore — empty body is fine
  }

  try {
    const params = signUpload(subfolder);
    return NextResponse.json(params);
  } catch (err) {
    return NextResponse.json(
      { error: toSafeMessage(err, "Failed to sign upload.") },
      { status: 500 },
    );
  }
}
