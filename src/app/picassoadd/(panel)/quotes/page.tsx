import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Role } from "@/domain/entities/role";
import { QuoteStatus, QUOTE_STATUSES } from "@/domain/entities/quoteStatus";
import { cn } from "@/lib/utils";
import { formatAdminDate, formatAdminTime } from "@/lib/admin-format";
import { QuoteStatusSelect } from "./QuoteStatusSelect";
import { DeleteQuoteButton } from "./DeleteQuoteButton";

interface QuotesPageProps {
  searchParams: Promise<{ status?: string; error?: string }>;
}

const STATUS_TONE: Record<QuoteStatus, "yellow" | "blue" | "gray"> = {
  NEW: "yellow",
  CONTACTED: "blue",
  CLOSED: "gray",
};

function isStatus(v: string | undefined): v is QuoteStatus {
  return !!v && QUOTE_STATUSES.includes(v as QuoteStatus);
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const me = await requireUser();
  const { status, error } = await searchParams;
  const filter = isStatus(status) ? status : undefined;

  const { quoteService } = getContainer();
  const [quotes, counts] = await Promise.all([
    quoteService.list({ status: filter }),
    quoteService.countsByStatus(),
  ]);
  const canWrite = me.role !== Role.VIEWER;
  const total = counts.NEW + counts.CONTACTED + counts.CLOSED;

  const tabs = [
    { key: "ALL" as const, label: "All", count: total, active: !filter },
    ...QUOTE_STATUSES.map((s) => ({
      key: s,
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      count: counts[s],
      active: filter === s,
    })),
  ];

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Quote requests"
        description="Customer enquiries submitted via the public site."
      />

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "ALL" ? "/picassoadd/quotes" : `/picassoadd/quotes?status=${t.key}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
              t.active
                ? "border-brand-gray-900 bg-brand-gray-900 text-brand-white"
                : "border-brand-gray-200 bg-brand-white text-brand-gray-700 hover:bg-brand-gray-50",
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                t.active ? "bg-brand-white/20" : "bg-brand-gray-100 text-brand-gray-700",
              )}
            >
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      <Card className="mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray-50 text-left text-xs uppercase tracking-wide text-brand-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Received</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {quotes.map((q) => (
              <tr key={q.id}>
                <td className="whitespace-nowrap px-5 py-3 text-brand-gray-700">
                  {formatAdminDate(q.createdAt)}{" "}
                  <span className="text-xs text-brand-gray-500">
                    {formatAdminTime(q.createdAt)}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium text-brand-gray-900">{q.name}</td>
                <td className="px-5 py-3 text-brand-gray-700">
                  <div>{q.email}</div>
                  <div className="text-xs text-brand-gray-500">{q.phone}</div>
                </td>
                <td className="px-5 py-3 text-brand-gray-700">
                  {q.product ? q.product.name : <span className="text-brand-gray-400">—</span>}
                </td>
                <td className="px-5 py-3">
                  {canWrite ? (
                    <QuoteStatusSelect id={q.id} status={q.status} />
                  ) : (
                    <Badge tone={STATUS_TONE[q.status]}>{q.status}</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/picassoadd/quotes/${q.id}`}
                      className="text-xs font-medium text-brand-gray-700 underline-offset-2 hover:underline"
                    >
                      View
                    </Link>
                    {canWrite && <DeleteQuoteButton id={q.id} name={q.name} />}
                  </div>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-brand-gray-500">
                  No quote requests {filter ? `with status ${filter}` : "yet"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
