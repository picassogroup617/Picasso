/**
 * Maps a Zod issues array to a `{ field: message }` record consumable by
 * server-action form state. Only the first issue per top-level field is kept
 * so the UI shows a single, focused error next to each input.
 *
 * The parameter type matches Zod 4's `$ZodIssue.path` shape (`PropertyKey[]`),
 * which is wider than `(string | number)[]` because it also admits `symbol`.
 */
export function fieldErrorsFromZod(
  issues: readonly { readonly path: readonly PropertyKey[]; readonly message: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    // Issues without a path (e.g. top-level refinements) get bucketed under
    // "_form" so callers can surface them instead of silently dropping them.
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
