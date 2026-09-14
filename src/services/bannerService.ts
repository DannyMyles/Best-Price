import { isFirebaseConfigured } from "@/lib/firebase/config";
import { fetchActiveBanners } from "@/lib/firebase/banners";
import { banners as seedBanners, sortBanners } from "@/lib/data/banners";
import type { Banner } from "@/lib/types";

export async function getBanners(): Promise<Banner[]> {
  if (!isFirebaseConfigured) return sortBanners(seedBanners);
  try {
    const remote = await fetchActiveBanners();
    return remote.length > 0 ? remote : sortBanners(seedBanners);
  } catch {
    return sortBanners(seedBanners);
  }
}
