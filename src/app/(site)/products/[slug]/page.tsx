import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { getProducts, getProductBySlug, getRelatedProducts } from "@/services/productService";
import { getCategory } from "@/lib/data/categories";
import { formatKES } from "@/lib/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ProductActions } from "./ProductActions";

// Regenerate periodically so products added/edited via the admin dashboard
// show up without a full rebuild; new slugs still render on-demand.
export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — BestPrice Technologies`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const all = await getProducts();
  const related = getRelatedProducts(all, product);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-ink">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/products?category=${product.category}`} className="hover:text-ink">
          {category?.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ScrollReveal y={16}>
          <ProductGallery product={product} />
        </ScrollReveal>

        <ScrollReveal y={16} delay={0.1}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {category?.name}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-semibold text-ink">
            {formatKES(product.price)}
          </p>

          <p className="mt-4 flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            {product.inStock ? "In stock — Nairobi CBD" : "Contact for availability"}
          </p>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
            {product.description}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-2 rounded-2xl border border-border bg-surface-muted/60 p-4 sm:grid-cols-2">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-2 text-sm">
                <span className="text-muted">{spec.label}</span>
                <span className="font-medium text-ink">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <ProductActions product={product} />
          </div>

          <p className="mt-4 text-xs text-muted">SKU: {product.sku}</p>
        </ScrollReveal>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-xl font-semibold tracking-tight text-ink">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
