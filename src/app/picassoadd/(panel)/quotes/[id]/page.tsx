import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Role } from "@/domain/entities/role";
import { QuoteStatus } from "@/domain/entities/quoteStatus";
import { formatAdminDateTime } from "@/lib/admin-format";
import { QuoteStatusSelect } from "../QuoteStatusSelect";
import { DeleteQuoteButton } from "../DeleteQuoteButton";

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_TONE: Record<QuoteStatus, "yellow" | "blue" | "gray"> = {
  NEW: "yellow",
  CONTACTED: "blue",
  CLOSED: "gray",
};

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const me = await requireUser();
  const { id } = await params;
  const quote = await getContainer().quoteService.getById(id);
  if (!quote) notFound();

  const canWrite = me.role !== Role.VIEWER;

  return (
    <div className="container-page max-w-3xl py-8">
      <Link
        href="/picassoadd/quotes"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to quote requests
      </Link>

      <div className="mt-3">
        <PageHeader
          title={`Quote from ${quote.name}`}
          description={`Received ${formatAdminDateTime(quote.createdAt)}`}
          actions={
            canWrite ? (
              <DeleteQuoteButton id={quote.id} name={quote.name} />
            ) : undefined
          }
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          {canWrite ? (
            <div className="w-40">
              <QuoteStatusSelect id={quote.id} status={quote.status} />
            </div>
          ) : (
            <Badge tone={STATUS_TONE[quote.status]}>{quote.status}</Badge>
          )}
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-gray-500">Email</p>
              <a
                href={`mailto:${quote.email}`}
                className="mt-1 inline-flex items-center gap-2 text-sm text-brand-gray-900 hover:underline"
              >
                <Mail className="h-4 w-4" /> {quote.email}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-gray-500">Phone</p>
              <a
                href={`tel:${quote.phone}`}
                className="mt-1 inline-flex items-center gap-2 text-sm text-brand-gray-900 hover:underline"
              >
                <Phone className="h-4 w-4" /> {quote.phone}
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-brand-gray-500">Product</p>
            <p className="mt-1 text-sm text-brand-gray-900">
              {quote.product ? (
                <Link
                  href={`/picassoadd/products/${quote.product.id}`}
                  className="hover:underline"
                >
                  {quote.product.name}
                </Link>
              ) : (
                <span className="text-brand-gray-400">No specific product</span>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-brand-gray-500">Message</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-brand-gray-900">
              {quote.message ?? (
                <span className="text-brand-gray-400">(none)</span>
              )}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
