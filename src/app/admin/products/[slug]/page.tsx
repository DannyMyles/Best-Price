"use client";

import { use, useEffect, useState } from "react";
import { fetchProductBySlug } from "@/lib/firebase/products";
import type { Product } from "@/lib/types";
import { ProductForm } from "../ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    fetchProductBySlug(slug).then(setProduct);
  }, [slug]);

  if (product === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (product === null) return <p className="text-sm text-muted">Product not found.</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-ink">Edit product</h1>
      <ProductForm initial={product} />
    </div>
  );
}
