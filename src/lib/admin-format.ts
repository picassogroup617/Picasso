/**
 * Date/time formatters for the admin panel. Pinned to `en-GB` + UTC so the
 * server-rendered output is stable across environments and never differs from
 * the client during hydration, regardless of the host machine's locale or
 * timezone.
 */

const DATE = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
});

const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function formatAdminDate(d: Date): string {
  return DATE.format(d);
}

export function formatAdminTime(d: Date): string {
  return TIME.format(d);
}

export function formatAdminDateTime(d: Date): string {
  return DATE_TIME.format(d);
}
