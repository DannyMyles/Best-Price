"use client";

import { useMemo, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import { Trash2, Pencil, Plus, Eye, EyeOff, GripVertical } from "lucide-react";
import {
  fetchAllBannersAdmin,
  upsertBanner,
  removeBanner,
  setBannerActive,
  reorderBanners,
} from "@/lib/firebase/banners";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { useAdminData, invalidateAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/context/ToastContext";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Banner } from "@/lib/types";

const emptyForm = {
  eyebrow: "",
  headline: "",
  subcopy: "",
  image: "",
  badge: "",
  ctaLabel: "",
  ctaHref: "",
  dealEndsAt: "",
  active: true,
};

const KEY = "admin:banners";

/** Local datetime-input value ("YYYY-MM-DDTHH:mm") from an ISO string, or
 *  "" when unset — the inverse of `new Date(value).toISOString()`. */
function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function AdminBannersPage() {
  const { push } = useToast();
  const { data, loading, error, refresh, mutate } = useAdminData<Banner[]>(
    KEY,
    fetchAllBannersAdmin,
    isFirebaseConfigured
  );
  const banners = useMemo(() => data ?? [], [data]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const reorderTimer = useRef<number | null>(null);

  function startEdit(b: Banner) {
    setEditingId(b.id);
    setForm({
      eyebrow: b.eyebrow ?? "",
      headline: b.headline,
      subcopy: b.subcopy ?? "",
      image: b.image,
      badge: b.badge ?? "",
      ctaLabel: b.ctaLabel ?? "",
      ctaHref: b.ctaHref ?? "",
      dealEndsAt: toDatetimeLocal(b.dealEndsAt),
      active: b.active !== false,
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.headline.trim()) return;
    if (!/^https?:\/\//i.test(form.image.trim())) {
      setFormError("Enter a full image URL starting with http(s)://");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await upsertBanner(editingId, {
        eyebrow: form.eyebrow.trim() || undefined,
        headline: form.headline.trim(),
        subcopy: form.subcopy.trim() || undefined,
        image: form.image.trim(),
        badge: form.badge.trim() || undefined,
        ctaLabel: form.ctaLabel.trim() || undefined,
        ctaHref: form.ctaHref.trim() || undefined,
        dealEndsAt: form.dealEndsAt
          ? new Date(form.dealEndsAt).toISOString()
          : null,
        active: form.active,
        order: editingId
          ? banners.find((b) => b.id === editingId)?.order ?? 0
          : banners.length,
      });
      invalidateAdminData(KEY);
      refresh();
      push({
        type: "success",
        message: editingId ? "Slide updated" : "Slide added",
      });
      resetForm();
    } catch {
      push({ type: "error", message: "Couldn't save slide" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(b: Banner) {
    setBusyId(b.id);
    const next = b.active === false;
    try {
      await setBannerActive(b.id, next);
      mutate(banners.map((x) => (x.id === b.id ? { ...x, active: next } : x)));
      push({
        type: "success",
        message: next ? "Slide is now visible" : "Slide hidden",
      });
    } catch {
      push({ type: "error", message: "Couldn't update visibility" });
    } finally {
      setBusyId(null);
    }
  }

  function handleReorder(next: Banner[]) {
    mutate(next);
    if (reorderTimer.current) window.clearTimeout(reorderTimer.current);
    reorderTimer.current = window.setTimeout(async () => {
      try {
        await reorderBanners(next.map((b) => b.id));
        invalidateAdminData(KEY);
      } catch {
        push({ type: "error", message: "Couldn't save new order" });
        refresh();
      }
    }, 500);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await removeBanner(pendingDelete.id);
      mutate(banners.filter((b) => b.id !== pendingDelete.id));
      push({ type: "success", message: `Deleted “${pendingDelete.headline}”` });
      setPendingDelete(null);
    } catch {
      push({ type: "error", message: "Couldn't delete slide" });
    } finally {
      setDeleting(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
        Firebase isn&apos;t configured — add your project credentials to{" "}
        <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">
          .env.local
        </code>{" "}
        to manage homepage banners.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-1 text-xl font-semibold text-ink">Homepage Banners</h1>
        <p className="mb-6 text-sm text-muted">
          Drag to reorder — this is the order slides play in the carousel.
        </p>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : error ? (
          <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
            Couldn&apos;t load banners.{" "}
            <button onClick={() => refresh()} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : banners.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            No slides yet — add your first one.
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={banners}
            onReorder={handleReorder}
            className="flex flex-col gap-2"
          >
            {banners.map((b) => (
              <Reorder.Item
                key={b.id}
                value={b}
                className={`flex items-center gap-3 rounded-2xl border border-border bg-white p-3 ${
                  b.active === false ? "opacity-55" : ""
                }`}
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted active:cursor-grabbing" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt=""
                  className="h-14 w-20 shrink-0 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {b.headline}
                  </p>
                  {b.eyebrow && (
                    <p className="truncate text-xs text-muted">{b.eyebrow}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleActive(b)}
                  disabled={busyId === b.id}
                  className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted hover:text-brand disabled:opacity-50"
                  aria-label={b.active === false ? "Show slide" : "Hide slide"}
                >
                  {b.active === false ? (
                    <>
                      <EyeOff className="h-4 w-4" /> Hidden
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" /> Visible
                    </>
                  )}
                </button>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() => startEdit(b)}
                    className="text-muted hover:text-brand"
                    aria-label={`Edit ${b.headline}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPendingDelete(b)}
                    className="text-muted hover:text-red-500"
                    aria-label={`Delete ${b.headline}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      <div>
        <h2 className="mb-6 text-sm font-semibold text-ink">
          {editingId ? "Edit slide" : "Add slide"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5"
        >
          <input
            required
            placeholder="Headline"
            value={form.headline}
            onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Eyebrow (small label above headline)"
            value={form.eyebrow}
            onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
            className="input"
          />
          <textarea
            placeholder="Subcopy"
            rows={2}
            value={form.subcopy}
            onChange={(e) => setForm((f) => ({ ...f, subcopy: e.target.value }))}
            className="input"
          />
          <input
            required
            placeholder="Image URL (https://…)"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            className="input"
          />
          <div className="flex gap-3">
            <input
              placeholder="Badge (e.g. New, Deal)"
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              className="input flex-1"
            />
          </div>
          <div className="flex gap-3">
            <input
              placeholder="Button label"
              value={form.ctaLabel}
              onChange={(e) =>
                setForm((f) => ({ ...f, ctaLabel: e.target.value }))
              }
              className="input flex-1"
            />
            <input
              placeholder="Button link (/products?…)"
              value={form.ctaHref}
              onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
              className="input flex-1"
            />
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink/70">
            Flash-deal countdown ends at (optional)
            <input
              type="datetime-local"
              value={form.dealEndsAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, dealEndsAt: e.target.value }))
              }
              className="input"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
            />
            Visible in storefront
          </label>
          {formError && <p className="text-xs text-danger">{formError}</p>}
          <div className="flex gap-2">
            <AnimatedButton
              type="submit"
              variant="primary"
              isLoading={saving}
              className="flex-1"
            >
              <Plus className="h-4 w-4" /> {editingId ? "Save" : "Add"}
            </AnimatedButton>
            {editingId && (
              <AnimatedButton type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </AnimatedButton>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        danger
        busy={deleting}
        title={`Delete “${pendingDelete?.headline ?? ""}”?`}
        confirmLabel="Delete slide"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
        body={<span>This slide will no longer show in the carousel.</span>}
      />
    </div>
  );
}
