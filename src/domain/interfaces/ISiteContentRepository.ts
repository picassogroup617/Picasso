import type { SiteContent } from "@/domain/entities/siteContent";

export interface UpsertSiteContentData {
  key: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
}

export interface ISiteContentRepository {
  findByKey(key: string): Promise<SiteContent | null>;
  /**
   * Projection used by the upsert flow to detect a changed imagePublicId
   * without round-tripping the full row.
   */
  findImagePublicIdByKey(key: string): Promise<string | null>;
  list(): Promise<SiteContent[]>;
  upsert(data: UpsertSiteContentData): Promise<SiteContent>;
}
