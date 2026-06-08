"use client";

import { useRef, useState, useTransition } from "react";
import { Select } from "@/components/ui/Select";
import { QuoteStatus, QUOTE_STATUSES } from "@/domain/entities/quoteStatus";
import { updateQuoteStatusAction } from "./actions";

const LABELS: Record<QuoteStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

export function QuoteStatusSelect({
  id,
  status,
  disabled,
}: {
  id: string;
  status: QuoteStatus;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Track the last value sent so we can roll the select back when the server
  // rejects the change.
  const lastCommittedRef = useRef<string>(status);

  return (
    <div className="space-y-1">
      <Select
        defaultValue={status}
        disabled={disabled || pending}
        onChange={(e) => {
          const next = e.target.value;
          const previous = lastCommittedRef.current;
          lastCommittedRef.current = next;
          setError(null);
          const form = new FormData();
          form.append("status", next);
          startTransition(async () => {
            const result = await updateQuoteStatusAction(id, form);
            if (!result.ok) {
              lastCommittedRef.current = previous;
              e.target.value = previous;
              setError(result.error ?? "Could not update status.");
            }
          });
        }}
        className="h-8 text-xs"
      >
        {QUOTE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </Select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
