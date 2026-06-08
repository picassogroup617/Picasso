/**
 * Converts the source PDF logo in `public/brand/` into a high-resolution PNG.
 *
 * Usage:
 *   node scripts/convert-logo.mjs
 *
 * Outputs:
 *   public/brand/logo.png          (page 1, scale 4 — high-res for retina)
 *   public/brand/logo@1x.png       (page 1, scale 1 — small reference)
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRAND_DIR = resolve(__dirname, "..", "public", "brand");

function findSourcePdf() {
  const files = readdirSync(BRAND_DIR).filter((f) => f.toLowerCase().endsWith(".pdf"));
  if (files.length === 0) {
    throw new Error(`No .pdf file found in ${BRAND_DIR}`);
  }
  // Prefer a file literally named logo.pdf, otherwise pick the first .pdf
  const preferred = files.find((f) => f.toLowerCase() === "logo.pdf");
  return join(BRAND_DIR, preferred ?? files[0]);
}

async function renderPdfToPng(pdfPath, scale, outputPath) {
  // Dynamic import keeps this script lightweight if user passes --help, etc.
  const { pdf } = await import("pdf-to-img");
  const document = await pdf(pdfPath, { scale });
  // Take the first page only
  for await (const page of document) {
    writeFileSync(outputPath, page);
    return;
  }
  throw new Error("PDF appears to contain no pages.");
}

async function main() {
  if (!existsSync(BRAND_DIR)) {
    mkdirSync(BRAND_DIR, { recursive: true });
  }

  const pdfPath = findSourcePdf();
  console.log(`Source PDF : ${pdfPath}`);

  const outHigh = join(BRAND_DIR, "logo.png");
  const outLow = join(BRAND_DIR, "logo@1x.png");

  console.log("Rendering high-res (scale 4)...");
  await renderPdfToPng(pdfPath, 4, outHigh);
  console.log(`  -> ${outHigh}`);

  console.log("Rendering 1x reference (scale 1)...");
  await renderPdfToPng(pdfPath, 1, outLow);
  console.log(`  -> ${outLow}`);

  console.log("\nDone. Logo files written to public/brand/.");
}

main().catch((err) => {
  console.error("\nConversion failed:", err?.message ?? err);
  process.exit(1);
});
