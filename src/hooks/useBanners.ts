"use client";

import { useEffect, useState } from "react";
import { getBanners } from "@/services/bannerService";
import type { Banner } from "@/lib/types";

let cache: Banner[] | null = null;

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let active = true;
    getBanners().then((result) => {
      if (!active) return;
      cache = result;
      setBanners(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { banners, loading };
}
