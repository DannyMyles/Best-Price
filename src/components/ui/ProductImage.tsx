import Image from "next/image";
import { ProductGlyph } from "./ProductGlyph";
import { CategorySlug } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ProductImage({
  src,
  category,
  alt,
  className,
  iconClassName,
  priority,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  fit = "cover",
}: {
  src?: string;
  category: CategorySlug;
  alt: string;
  className?: string;
  iconClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** `contain` shows the whole photo on a white backdrop (product detail). */
  fit?: "cover" | "contain";
}) {
  const resolved = src;

  if (!resolved) {
    return (
      <ProductGlyph category={category} className={className} iconClassName={iconClassName} />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", fit === "contain" ? "bg-white" : "bg-surface-muted", className)}>
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={resolved.startsWith("http")}
        className={fit === "contain" ? "object-contain" : "object-cover"}
      />
    </div>
  );
}
