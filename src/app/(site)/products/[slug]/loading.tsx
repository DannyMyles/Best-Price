import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="section py-8 sm:py-12">
      <Skeleton className="mb-6 h-4 w-56" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="mt-3 flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 flex-1 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
