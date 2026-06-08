import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and dasherises plain text", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Déjà Vu")).toBe("cafe-deja-vu");
  });

  it("collapses runs of non-alphanumerics to a single dash", () => {
    expect(slugify("foo --- bar___baz")).toBe("foo-bar-baz");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("---hello---")).toBe("hello");
  });

  it("returns an empty string for input with no alphanumerics", () => {
    expect(slugify("   !!!   ")).toBe("");
  });

  it("caps length at 80 characters", () => {
    const long = "a".repeat(200);
    expect(slugify(long)).toHaveLength(80);
  });
});
