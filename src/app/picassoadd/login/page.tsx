import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  "session-revoked":
    "Your session is no longer valid. Please sign in again.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Picasso";
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl font-semibold tracking-tight">
              {siteName}
            </span>
          </Link>
          <p className="mt-2 text-sm text-brand-gray-500">Admin sign in</p>
        </div>

        <div className="rounded-xl border border-brand-gray-200 bg-brand-white p-6 shadow-soft">
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {errorMessage}
            </div>
          )}
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-brand-gray-500">
          Restricted area. Authorized personnel only.
        </p>
      </div>
    </main>
  );
}
