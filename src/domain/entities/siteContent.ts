/** Single key/value content block (Hero, Story, Vision, Address...). */
export interface SiteContent {
  key: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imagePublicId: string | null;
}
