import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Store,
  Star,
} from "lucide-react";
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getColorVariants,
  selectBundle,
} from "@/services/productService";
import { getCategory } from "@/lib/data/categories";
import { getCategoryImages } from "@/lib/data/categoryImages";
import { formatKES } from "@/lib/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { StockPill } from "@/components/ui/StockPill";
import { ProductActions } from "./ProductActions";
import { DeliveryEstimator } from "@/components/product/DeliveryEstimator";
import { FrequentlyBoughtTogether } from "@/components/product/FrequentlyBoughtTogether";
import { ProductReviews } from "@/components/product/ProductReviews";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { MPESA_PAYBILL_NUMBER, STORE_ADDRESS } from "@/lib/contact";

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
  const image =
    product.images?.[0] ?? getCategoryImages(product.category)[0];
  const priceLine =
    product.price !== null ? ` — ${formatKES(product.price)}` : "";
  return {
    title: product.name,
    description: `${product.description}${priceLine}. Genuine, warrantied, delivered countrywide with M-Pesa payment.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} · PriceHub`,
      description: product.description,
      url: `/products/${product.slug}`,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
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
  const variants = getColorVariants(all, product);
  const bundle = product.price !== null ? selectBundle(all, product) : [];

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pricehub.co.ke";
  const productImages = product.images?.length
    ? product.images
    : getCategoryImages(product.category).slice(0, 1);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: productImages,
    category: category?.name,
    ...(product.rating != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: Math.max(1, product.reviewCount ?? 1),
          },
        }
      : {}),
    ...(product.price !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "KES",
            price: product.price,
            availability:
              product.inStock && product.stockCount !== 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: `${siteUrl}/products/${product.slug}`,
            seller: { "@type": "Organization", name: "PriceHub" },
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${siteUrl}/products`,
      },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: `${siteUrl}/products?category=${category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 4 : 3,
        name: product.name,
        item: `${siteUrl}/products/${product.slug}`,
      },
    ],
  };

  return (
    <div className="section py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, breadcrumbJsonLd]),
        }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted"
      >
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-ink">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-ink"
        >
          {category?.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        <ScrollReveal y={16}>
          <ProductGallery product={product} />
        </ScrollReveal>

        <ScrollReveal y={16} delay={0.1}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {category?.name}
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {product.name}
          </h1>

          {product.rating != null && (
            <a
              href="#reviews"
              className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
            >
              <Rating value={product.rating} showNumber />
              <span className="underline-offset-2 hover:underline">
                {product.reviewCount ?? 0} reviews
              </span>
            </a>
          )}

          <div className="mt-4">
            <Price
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="lg"
            />
          </div>

          <div className="mt-3">
            <StockPill product={product} />
          </div>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
            {product.description}
          </p>

          {variants.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-ink/70">
                Colour: <span className="text-ink">{product.color}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <Link
                    key={v.slug}
                    href={`/products/${v.slug}`}
                    aria-current={v.slug === product.slug ? "true" : undefined}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      v.slug === product.slug
                        ? "border-brand bg-brand-050 text-brand"
                        : "border-border text-ink/70 hover:border-brand/40"
                    }`}
                  >
                    {v.color}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-2 rounded-2xl border border-border bg-surface-muted/50 p-4 sm:grid-cols-2">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="flex justify-between gap-2 text-sm"
              >
                <span className="text-muted">{spec.label}</span>
                <span className="font-medium text-ink">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <ProductActions product={product} />
          </div>

          <div className="mt-6">
            <DeliveryEstimator />
          </div>

          <p className="mt-4 text-xs text-muted">SKU: {product.sku}</p>
        </ScrollReveal>
      </div>

      {/* Reassurance cards */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={Truck}
          title="Delivery"
          body={`Free pickup at ${STORE_ADDRESS.split(",")[0]}, or courier countrywide in 2–5 days.`}
        />
        <InfoCard
          icon={Store}
          title="Payment"
          body={`Pay on M-Pesa (Send Money to ${MPESA_PAYBILL_NUMBER}), cash on delivery, or bank transfer.`}
        />
        <InfoCard
          icon={ShieldCheck}
          title="Warranty"
          body="Genuine product with standard manufacturer warranty. Keep your order reference."
        />
        <InfoCard
          icon={RotateCcw}
          title="Returns"
          body="7-day returns on unopened items. See our returns policy for details."
        />
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-base font-semibold text-ink">Description</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {product.description}
        </p>
      </div>

      {bundle.length > 0 && (
        <FrequentlyBoughtTogether main={product} addons={bundle} />
      )}

      <ProductReviews
        sku={product.sku}
        productName={product.name}
        fallbackRating={product.rating}
        fallbackCount={product.reviewCount}
      />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
            <Star className="h-5 w-5 text-brand" /> You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}

      <RecentlyViewed currentSlug={product.slug} />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Truck;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-050 text-brand">
        <Icon className="h-4.5 w-4.5" strokeWidth={1.7} />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
    </div>
  );
}
