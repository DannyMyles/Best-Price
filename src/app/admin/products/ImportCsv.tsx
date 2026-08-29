"use client";

import { useState } from "react";
import { Upload, Download, Loader2, Check, AlertTriangle } from "lucide-react";
import { parseCsv } from "@/lib/csv";
import { slugify } from "@/lib/format";
import { upsertProduct } from "@/lib/firebase/products";
import type { ProductDoc } from "@/types/firestore";

const COLUMNS = [
  "sku",
  "name",
  "category",
  "price",
  "compareAtPrice",
  "description",
  "color",
  "stockCount",
  "rating",
  "reviewCount",
  "badge",
  "featured",
  "inStock",
  "image1",
  "image2",
  "image3",
];

const TEMPLATE =
  COLUMNS.join(",") +
  "\n" +
  [
    "SM-A556-256",
    "Samsung Galaxy A55 5G 256GB",
    "phones",
    "55999",
    "",
    '"6.6"" 120Hz AMOLED, 50MP camera, 5000mAh battery."',
    "Navy",
    "8",
    "",
    "",
    "Best Seller",
    "false",
    "true",
    "https://example.com/a55-1.jpg",
    "",
    "",
  ].join(",") +
  "\n";

function num(v: string): number | null {
  if (!v || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function bool(v: string, dflt = true): boolean {
  if (!v) return dflt;
  return /^(true|yes|y|1)$/i.test(v.trim());
}

export function ImportCsv({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    ok: number;
    errors: string[];
  } | null>(null);

  async function runImport() {
    setBusy(true);
    setResult(null);
    const rows = parseCsv(text);
    if (rows.length === 0) {
      setResult({ ok: 0, errors: ["No data rows found. Check the header line."] });
      setBusy(false);
      return;
    }
    let ok = 0;
    const errors: string[] = [];
    for (const [i, r] of rows.entries()) {
      const label = r.name || r.sku || `row ${i + 2}`;
      if (!r.sku?.trim() || !r.name?.trim() || !r.category?.trim()) {
        errors.push(`${label}: missing sku, name or category`);
        continue;
      }
      const slug = slugify(`${r.name}-${r.sku}`);
      const doc: Omit<ProductDoc, "createdAt" | "updatedAt"> = {
        sku: r.sku.trim(),
        name: r.name.trim(),
        category: r.category.trim().toLowerCase(),
        price: num(r.price),
        compareAtPrice: num(r.compareAtPrice),
        description: r.description?.trim() ?? "",
        specs: [],
        color: r.color?.trim() || undefined,
        images: [r.image1, r.image2, r.image3].filter((u) => u && u.trim()),
        inStock: bool(r.inStock, true),
        stockCount: num(r.stockCount),
        rating: num(r.rating),
        reviewCount: num(r.reviewCount),
        featured: bool(r.featured, false),
        badge: (r.badge?.trim() as ProductDoc["badge"]) || undefined,
      };
      try {
        await upsertProduct(slug, doc);
        ok++;
      } catch {
        errors.push(`${label}: failed to save`);
      }
    }
    setResult({ ok, errors });
    setBusy(false);
    if (ok > 0) onDone();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink hover:border-brand/40"
      >
        <Upload className="h-4 w-4" /> Import CSV
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Bulk import products</h2>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`}
          download="pricehub-products-template.csv"
          className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
        >
          <Download className="h-3.5 w-3.5" /> Download template
        </a>
      </div>

      <p className="mt-2 text-xs text-muted">
        Columns: {COLUMNS.join(", ")}. Existing SKUs are updated. Specs are added
        per-product in the form.
      </p>

      <input
        type="file"
        accept=".csv,text/csv"
        className="mt-3 block text-xs"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) setText(await f.text());
        }}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="…or paste CSV here"
        className="input mt-2 font-mono text-xs"
      />

      {result && (
        <div className="mt-3 space-y-1 text-xs">
          <p className="flex items-center gap-1.5 font-medium text-success">
            <Check className="h-3.5 w-3.5" /> {result.ok} product
            {result.ok !== 1 && "s"} imported
          </p>
          {result.errors.map((err, i) => (
            <p key={i} className="flex items-center gap-1.5 text-danger">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {err}
            </p>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={runImport}
          disabled={busy || !text.trim()}
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Importing…" : "Import"}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setResult(null);
          }}
          className="rounded-full px-4 py-2 text-sm text-muted hover:text-ink"
        >
          Close
        </button>
      </div>
    </div>
  );
}
