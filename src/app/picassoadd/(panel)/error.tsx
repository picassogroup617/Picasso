"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

/**
 * Error boundary for the admin panel. Keeps the AdminShell (sidebar, profile
 * footer) visible because this file sits inside the (panel) segment, below
 * the panel layout that renders the shell.
 */
export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("PanelError:", error);
  }, [error]);

  return (
    <div className="container-page py-8">
      <Alert tone="error">
        <div>
          <p className="font-medium">Something went wrong.</p>
          <p className="mt-1 text-sm">
            The page failed to load. Try again, or go back to the dashboard.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs opacity-70">
              Ref: {error.digest}
            </p>
          )}
        </div>
      </Alert>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Link href="/picassoadd/dashboard">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
