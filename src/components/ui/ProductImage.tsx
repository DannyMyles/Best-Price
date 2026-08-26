import Image from "next/image";
import { ProductGlyph } from "./ProductGlyph";
import { getCategoryImages } from "@/lib/data/categoryImages";
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
}: {
  src?: string;
  category: CategorySlug;
  alt: string;
  className?: string;
  iconClassName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const resolved = src ?? getCategoryImages(category)[0];

  if (!resolved) {
    return (
      <ProductGlyph category={category} className={className} iconClassName={iconClassName} />
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-surface-muted", className)}>
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
