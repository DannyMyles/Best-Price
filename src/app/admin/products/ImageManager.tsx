"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Star, Trash2, Upload } from "lucide-react";
import {
  adminDeleteImage,
    adminImages,
  adminReorderImages,
  adminUploadImages,
  type ImageEntry,
} from "@/lib/api/images";
import { errorMessage } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";

/**
 * Photo manager for an existing product. Files live in the pricehub image
 * library on the backend (`<category folder>/<item name>/<item name> - N.jpg`);
 * position 1 is the primary photo. Every action here writes to disk right away.
 */
export function ImageManager({
  productId,
  onChange,
}: {
  productId: number;
  onChange?: (urls: string[]) => void;
}) {
  const { push } = useToast();
  const [images, setImages] = useState<ImageEntry[] | null>(null);
  const [max, setMax] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const apply = useCallback(
    (list: ImageEntry[]) => {
      setImages(list);
      onChange?.(list.map((i) => i.url));
    },
    [onChange]
  );

  useEffect(() => {
    let live = true;
    adminImages(productId)
      .then((r) => {
        if (!live) return;
        setMax(r.max);
        apply(r.images);
      })
      .catch((e) => live && setError(errorMessage(e, "Couldn't load photos")));
    return () => {
      live = false;
    };
  }, [productId, apply]);

  async function run<T extends { images: ImageEntry[] }>(job: () => Promise<T>, ok?: string) {
    setBusy(true);
    setError(null);
    try {
      const r = await job();
      apply(r.images);
      if (ok) push({ type: "success", message: ok });
    } catch (e) {
      setError(errorMessage(e, "Photo update failed"));
    } finally {
      setBusy(false);
    }
  }

  function upload(files: FileList | null) {
    if (!files?.length) return;
    void run(() => adminUploadImages(productId, Array.from(files)), "Photos uploaded");
    if (input.current) input.current.value = "";
  }

  function move(index: number, to: number) {
    if (!images || to < 0 || to >= images.length) return;
    const files = images.map((i) => i.file);
    [files[index], files[to]] = [files[to], files[index]];
    void run(() => adminReorderImages(productId, files));
  }

  const list = images ?? [];

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink/70">
        Photos
      </p>

      {images === null && !error && <p className="text-sm text-muted">Loading photos…</p>}

      <div className="flex flex-wrap gap-3">
        {list.map((img, i) => (
          <div key={img.file} className="w-24">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-24 w-24 rounded-lg border border-border object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-panel-dark px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  <Star className="h-2.5 w-2.5" /> Main
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between text-muted">
              <button type="button" disabled={busy || i === 0} onClick={() => move(i, i - 1)} aria-label="Move earlier" className="p-1 hover:text-brand disabled:opacity-30">
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (confirm("Delete this photo?")) void run(() => adminDeleteImage(productId, img.file), "Photo deleted");
                }}
                aria-label="Delete photo"
                className="p-1 hover:text-red-500 disabled:opacity-30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" disabled={busy || i === list.length - 1} onClick={() => move(i, i + 1)} aria-label="Move later" className="p-1 hover:text-brand disabled:opacity-30">
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {images !== null && (max === 0 || list.length < max) && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted hover:border-brand/50">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-[10px]">Upload</span>
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={busy}
              className="hidden"
              onChange={(e) => upload(e.target.files)}
            />
          </label>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-1.5 text-xs text-muted">
        JPG, PNG or WebP. The first photo is the main one; use the arrows to reorder. Photos are stored in the
        database. With none, the category&apos;s default picture is shown.
      </p>
    </div>
  );
}
