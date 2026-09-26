"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, X } from "lucide-react";
import {
  adminCreateProduct,
  adminUpdateProduct,
  type ProductInput,
} from "@/lib/api/products";
import { adminCategories } from "@/lib/api/categories";
import { adminUploadImages } from "@/lib/api/images";
import { errorMessage } from "@/lib/api/client";
import { useAdminData, invalidateAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/context/ToastContext";
import { categories as seedCategories } from "@/lib/data/categories";
import { ImageManager } from "./ImageManager";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import type {
  Product,
  ProductSpec,
  CategorySlug,
  ProductBadge,
  Category,
} from "@/lib/types";

const BADGE_OPTIONS: ProductBadge[] = [
  "New",
  "Best Seller",
  "Popular",
  "Sale",
  "Clearance",
  "Limited",
];

export function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const { push } = useToast();
  const { data: liveCategories } = useAdminData<Category[]>(
    "admin:categories",
    adminCategories
  );
  const categories =
    liveCategories && liveCategories.length > 0
      ? liveCategories
      : seedCategories;
  const isEdit = Boolean(initial);

  const [sku, setSku] = useState(initial?.sku ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<CategorySlug>(
    initial?.category ?? categories[0]?.slug ?? ""
  );
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.compareAtPrice?.toString() ?? ""
  );
  const [stockCount, setStockCount] = useState(
    initial?.stockCount?.toString() ?? ""
  );
  const [rating, setRating] = useState(initial?.rating?.toString() ?? "");
  const [reviewCount, setReviewCount] = useState(
    initial?.reviewCount?.toString() ?? ""
  );
  const [badge, setBadge] = useState<string>(initial?.badge ?? "");
  const [featureRank, setFeatureRank] = useState(
    initial?.featureRank?.toString() ?? ""
  );
  const [color, setColor] = useState(initial?.color ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [brand, setBrand] = useState(initial?.brand ?? "");
  // New products: photos are staged here and uploaded right after the product is created.
  const [staged, setStaged] = useState<File[]>([]);
  const [specs, setSpecs] = useState<ProductSpec[]>(initial?.specs ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!sku.trim() || !name.trim()) {
      setError("SKU and name are required.");
      return;
    }
    setSaving(true);
    try {
      const payload: Omit<ProductInput, "slug"> = {
        sku: sku.trim(),
        name: name.trim(),
        category,
        brand: brand.trim() || null,
        price: price.trim() === "" ? null : Number(price),
        compareAtPrice: compareAtPrice.trim() === "" ? null : Number(compareAtPrice),
        description: description.trim(),
        specs: specs.filter((s) => s.label.trim() && s.value.trim()),
        color: color.trim() || null,
        inStock,
        stockCount: stockCount.trim() === "" ? null : Number(stockCount),
        rating: rating.trim() === "" ? null : Number(rating),
        reviewCount: reviewCount.trim() === "" ? null : Number(reviewCount),
        badge: (badge as ProductBadge) || null,
        featureRank: featureRank.trim() === "" ? null : Number(featureRank),
        featured,
        active,
      };
      if (initial?.id) {
        await adminUpdateProduct(initial.id, payload);
      } else {
        const created = await adminCreateProduct(payload);
        if (staged.length > 0) {
          try {
            await adminUploadImages(created.id!, staged);
          } catch (e) {
            invalidateAdminData("admin:products");
            push({ type: "error", message: `Product saved, but photos failed: ${errorMessage(e, "upload error")}` });
            router.push(`/admin/products/${created.id}`);
            return;
          }
        }
      }
      invalidateAdminData("admin:products");
      invalidateAdminData("admin:stats");
      push({ type: "success", message: isEdit ? "Product updated" : "Product created" });
      router.push("/admin/products");
    } catch (err) {
      const msg = errorMessage(err, "Couldn't save product. Check your connection and try again.");
      setError(msg);
      push({ type: "error", message: "Couldn't save product" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="SKU">
          <input
            required
            disabled={isEdit}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="input disabled:opacity-60"
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategorySlug)}
            className="input"
          >
            {category &&
              !categories.some((c) => c.slug === category) && (
                <option value={category}>{category} (unknown)</option>
              )}
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
                {c.active === false ? " — hidden" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name" className="sm:col-span-2">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </Field>
        <Field label="Brand (optional)">
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className="input" />
        </Field>
        <Field label="Price (KES, blank = price on request)">
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Compare-at price (KES, optional — shows a Sale badge)">
          <input
            type="number"
            min={0}
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Color (optional)">
          <input value={color} onChange={(e) => setColor(e.target.value)} className="input" />
        </Field>
        <Field label="Stock count (optional — 1–3 shows Low stock)">
          <input
            type="number"
            min={0}
            value={stockCount}
            onChange={(e) => setStockCount(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Rating (0–5, optional)">
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Review count (optional)">
          <input
            type="number"
            min={0}
            value={reviewCount}
            onChange={(e) => setReviewCount(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Badge (optional)">
          <select
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="input"
          >
            <option value="">No badge</option>
            {BADGE_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Feature rank (optional — lower shows first)">
          <input
            type="number"
            min={0}
            value={featureRank}
            onChange={(e) => setFeatureRank(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-ink/70">Specs</p>
        <div className="flex flex-col gap-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Label"
                value={spec.label}
                onChange={(e) =>
                  setSpecs((prev) => prev.map((s, j) => (j === i ? { ...s, label: e.target.value } : s)))
                }
                className="input flex-1"
              />
              <input
                placeholder="Value"
                value={spec.value}
                onChange={(e) =>
                  setSpecs((prev) => prev.map((s, j) => (j === i ? { ...s, value: e.target.value } : s)))
                }
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => setSpecs((prev) => prev.filter((_, j) => j !== i))}
                className="flex h-10 w-10 shrink-0 items-center justify-center text-muted hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSpecs((prev) => [...prev, { label: "", value: "" }])}
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand"
          >
            <Plus className="h-4 w-4" /> Add spec
          </button>
        </div>
      </div>

      {initial?.id ? (
        <ImageManager productId={initial.id} />
      ) : (
        <div>
          <p className="mb-2 text-xs font-medium text-ink/70">Photos (optional — uploaded when you create the product)</p>
          <div className="flex flex-wrap gap-3">
            {staged.map((file, i) => (
              <span key={`${file.name}-${i}`} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-20 w-20 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setStaged((prev) => prev.filter((_, j) => j !== i))}
                  aria-label="Remove photo"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted hover:border-brand/50">
              <Upload className="h-5 w-5" />
              <span className="text-[10px]">Add</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setStaged((prev) => [...prev, ...files]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            JPG, PNG or WebP. The first photo is the main one; reorder later from the edit page.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          In stock
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Visible in storefront
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <AnimatedButton type="submit" variant="primary" disabled={saving} className="w-fit disabled:opacity-60">
        {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
      </AnimatedButton>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-ink/70">{label}</label>
      {children}
    </div>
  );
}
