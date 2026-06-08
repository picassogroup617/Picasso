import { beforeEach, describe, expect, it, vi } from "vitest";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const { categoryListMock, productListMock } = vi.hoisted(() => ({
  categoryListMock: vi.fn(),
  productListMock: vi.fn(),
}));

vi.mock("@/lib/container", () => ({
  getContainer: () => ({
    categoryService: { list: categoryListMock },
    productService: { list: productListMock },
  }),
}));

import sitemap from "@/app/sitemap";

beforeEach(() => {
  categoryListMock.mockReset();
  productListMock.mockReset();
});

describe("sitemap", () => {
  it("includes the static public routes", async () => {
    categoryListMock.mockResolvedValue([]);
    productListMock.mockResolvedValue([]);

    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/categories`);
  });

  it("requests only published categories and products from the services", async () => {
    categoryListMock.mockResolvedValue([]);
    productListMock.mockResolvedValue([]);

    await sitemap();

    expect(categoryListMock).toHaveBeenCalledWith({ publishedOnly: true });
    expect(productListMock).toHaveBeenCalledWith({ publishedOnly: true });
  });

  it("emits an entry per published category and product with lastModified", async () => {
    const date = new Date("2024-06-01T00:00:00Z");
    categoryListMock.mockResolvedValue([
      { slug: "tools", updatedAt: date },
      { slug: "lighting", updatedAt: date },
    ]);
    productListMock.mockResolvedValue([{ slug: "hammer", updatedAt: date }]);

    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain(`${SITE_URL}/categories/tools`);
    expect(urls).toContain(`${SITE_URL}/categories/lighting`);
    expect(urls).toContain(`${SITE_URL}/products/hammer`);
    const hammer = entries.find((e) => e.url.endsWith("/products/hammer"));
    expect(hammer?.lastModified).toEqual(date);
  });

  it("degrades to the static routes when the database throws", async () => {
    categoryListMock.mockRejectedValue(new Error("db down"));
    productListMock.mockResolvedValue([]);

    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toEqual([`${SITE_URL}/`, `${SITE_URL}/categories`]);
  });
});
