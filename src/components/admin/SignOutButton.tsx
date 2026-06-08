import { LogOut } from "lucide-react";
import { signOut } from "@/auth";

/**
 * Server-action sign-out button rendered inside a form.
 * Kept tiny so it can be embedded inside the sidebar footer.
 */
export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/picassoadd/login" });
      }}
    >
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-brand-gray-700 transition hover:bg-brand-gray-100"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sign out
      </button>
    </form>
  );
}
