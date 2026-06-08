import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { QuoteStatus } from "@/domain/entities/quoteStatus";
import { formatAdminDate } from "@/lib/admin-format";

interface DashboardPageProps {
  searchParams: Promise<{ error?: string }>;
}

const STATUS_TONE: Record<QuoteStatus, "yellow" | "blue" | "gray"> = {
  NEW: "yellow",
  CONTACTED: "blue",
  CLOSED: "gray",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { error } = await searchParams;
  const { quoteService } = getContainer();
  const [counts, recent] = await Promise.all([
    quoteService.countsByStatus(),
    quoteService.list({ limit: 5 }),
  ]);
  const total = counts.NEW + counts.CONTACTED + counts.CLOSED;

  const stats = [
    { label: "New requests", value: counts.NEW, href: "/picassoadd/quotes?status=NEW", tone: "yellow" as const },
    { label: "Contacted", value: counts.CONTACTED, href: "/picassoadd/quotes?status=CONTACTED", tone: "blue" as const },
    { label: "Closed", value: counts.CLOSED, href: "/picassoadd/quotes?status=CLOSED", tone: "gray" as const },
    { label: "All quotes", value: total, href: "/picassoadd/quotes", tone: "gray" as const },
  ];

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your catalog and recent activity."
      />

      {error === "forbidden" && (
        <Alert tone="error" className="mt-4">
          You don&apos;t have permission to access that page.
        </Alert>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block">
            <Card className="transition hover:border-brand-yellow">
              <CardBody>
                <p className="text-xs uppercase tracking-wide text-brand-gray-500">
                  {s.label}
                </p>
                <p className="mt-2 font-display text-3xl font-semibold text-brand-gray-900">
                  {s.value}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent quote requests</CardTitle>
          <Link
            href="/picassoadd/quotes"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-gray-700 hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <table className="w-full text-sm">
          <thead className="bg-brand-gray-50 text-left text-xs uppercase tracking-wide text-brand-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Received</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {recent.map((q) => (
              <tr key={q.id} className="hover:bg-brand-gray-50">
                <td className="whitespace-nowrap px-5 py-3 text-brand-gray-700">
                  {formatAdminDate(q.createdAt)}
                </td>
                <td className="px-5 py-3 font-medium text-brand-gray-900">
                  <Link href={`/picassoadd/quotes/${q.id}`} className="hover:underline">
                    {q.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-brand-gray-700">
                  {q.product?.name ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={STATUS_TONE[q.status]}>{q.status}</Badge>
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-brand-gray-500">
                  No quote requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
