"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/domain/schemas/auth";
import { getClientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";

export type LoginActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
};

/** Failed-attempt budgets. Successful sign-ins are not counted (see below). */
const IP_ATTEMPT_LIMIT = 10;
const EMAIL_ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: LoginActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "email" || field === "password") {
        fieldErrors[field] = issue.message;
      }
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  // Throttle by IP and by email separately. IP-keyed budget stops a single
  // host from spraying many accounts; email-keyed budget stops distributed
  // brute force against a known account.
  const ip = await getClientIp();
  const emailKey = parsed.data.email.toLowerCase();
  const ipCheck = rateLimiter.check(
    `login-ip:${ip}`,
    IP_ATTEMPT_LIMIT,
    ATTEMPT_WINDOW_MS,
  );
  const emailCheck = rateLimiter.check(
    `login-email:${emailKey}`,
    EMAIL_ATTEMPT_LIMIT,
    ATTEMPT_WINDOW_MS,
  );
  if (!ipCheck.ok || !emailCheck.ok) {
    const wait = Math.max(
      ipCheck.retryAfterSeconds ?? 0,
      emailCheck.retryAfterSeconds ?? 0,
    );
    const minutes = Math.max(1, Math.ceil(wait / 60));
    return {
      ok: false,
      error: `Too many sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/picassoadd/dashboard",
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      // CredentialsSignin = bad email/password
      return { ok: false, error: "Invalid email or password." };
    }
    // Next.js redirect throws an internal error that must be re-thrown
    throw err;
  }
}
