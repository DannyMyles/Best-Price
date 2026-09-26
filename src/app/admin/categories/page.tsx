"use client";

import { useMemo, useState } from "react";
import { Trash2, Pencil, Plus, Eye, EyeOff } from "lucide-react";
import {
  adminCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "@/lib/api/categories";
import { errorMessage } from "@/lib/api/client";
import { useAdminData, invalidateAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/context/ToastContext";
import { slugify } from "@/lib/format";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Category } from "@/lib/types";

const ICONS = [
  "laptop",
  "smartphone",
  "tablet",
  "monitor",
  "camera",
  "aperture",
  "tv",
  "speaker",
  "puzzle",
  "cpu",
];

const emptyForm = {
  slug: "",
  name: "",
  shortName: "",
  description: "",
  icon: "laptop",
  order: "0",
  active: true,
};

const KEY = "admin:categories";

export default function AdminCategoriesPage() {
  const { push } = useToast();
  const { data, loading, error, refresh, mutate } = useAdminData<Category[]>(
    KEY,
    adminCategories
  );
  const categories = useMemo(() => data ?? [], [data]);

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Delete flow (with product reassignment)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  const [deleting, setDeleting] = useState(false);

  function startEdit(c: Category) {
    setEditing(c);
    setForm({
      slug: c.slug,
      name: c.name,
      shortName: c.shortName,
      description: c.description,
      icon: c.icon,
      order: String(c.order ?? 0),
      active: c.active !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const fields = {
        name: form.name.trim(),
        shortName: form.shortName.trim() || form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        sortOrder: Number(form.order) || 0,
        active: form.active,
      };
      if (editing?.id) await adminUpdateCategory(editing.id, fields);
      else await adminCreateCategory({ ...fields, slug: form.slug.trim() || slugify(form.name) });
      invalidateAdminData(KEY);
      refresh();
      push({
        type: "success",
        message: editing ? "Category updated" : "Category added",
      });
      resetForm();
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't save category") });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Category) {
    setBusyId(c.id ?? null);
    const next = c.active === false;
    try {
      await adminUpdateCategory(c.id!, { active: next });
      mutate(
        categories.map((x) => (x.id === c.id ? { ...x, active: next } : x))
      );
      push({
        type: "success",
        message: next ? "Category is now visible" : "Category hidden",
      });
    } catch {
      push({ type: "error", message: "Couldn't update visibility" });
    } finally {
      setBusyId(null);
    }
  }

  const affected = pendingDelete?.productCount ?? 0;

  function openDelete(c: Category) {
    setPendingDelete(c);
    setReassignTo("");
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    if (affected > 0 && !reassignTo) {
      push({ type: "error", message: "Pick a category to move products to" });
      return;
    }
    setDeleting(true);
    try {
      await adminDeleteCategory(pendingDelete.id!, affected > 0 ? reassignTo : undefined);
      if (affected > 0) {
        invalidateAdminData("admin:products");
        push({ type: "info", message: `Moved ${affected} product(s) to ${reassignTo}` });
      }
      mutate(categories.filter((c) => c.id !== pendingDelete.id));
      push({ type: "success", message: `Deleted “${pendingDelete.name}”` });
      setPendingDelete(null);
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't delete category") });
    } finally {
      setDeleting(false);
    }
  }

  const reassignOptions = categories.filter(
    (c) => c.slug !== pendingDelete?.slug
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-6 text-xl font-semibold text-ink">Categories</h1>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : error ? (
          <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
            Couldn&apos;t load categories.{" "}
            <button onClick={() => refresh()} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Visible</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((c) => (
                  <tr
                    key={c.id}
                    className={c.active === false ? "opacity-55" : undefined}
                  >
                    <td className="px-4 py-3 tabular-nums text-muted">
                      {c.order ?? 0}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                    <td className="px-4 py-3 text-muted">{c.slug}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(c)}
                        disabled={busyId === c.id}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-brand disabled:opacity-50"
                        aria-label={
                          c.active === false ? "Show category" : "Hide category"
                        }
                      >
                        {c.active === false ? (
                          <>
                            <EyeOff className="h-4 w-4" /> Hidden
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" /> Visible
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => startEdit(c)}
                          className="text-muted hover:text-brand"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDelete(c)}
                          className="text-muted hover:text-red-500"
                          aria-label={`Delete ${c.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-6 text-sm font-semibold text-ink">
          {editing ? "Edit category" : "Add category"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5"
        >
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Short name (nav label)"
            value={form.shortName}
            onChange={(e) =>
              setForm((f) => ({ ...f, shortName: e.target.value }))
            }
            className="input"
          />
          <textarea
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="input"
          />
          <div className="flex gap-3">
            <select
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className="input flex-1"
            >
              {ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
            <input
              type="number"
              aria-label="Nav order"
              title="Nav order (lower shows first)"
              value={form.order}
              onChange={(e) =>
                setForm((f) => ({ ...f, order: e.target.value }))
              }
              className="input w-20"
            />
          </div>
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
          <div className="flex gap-2">
            <AnimatedButton
              type="submit"
              variant="primary"
              isLoading={saving}
              className="flex-1"
            >
              <Plus className="h-4 w-4" /> {editing ? "Save" : "Add"}
            </AnimatedButton>
            {editing && (
              <AnimatedButton
                type="button"
                variant="secondary"
                onClick={resetForm}
              >
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
        title={`Delete “${pendingDelete?.name ?? ""}”?`}
        confirmLabel="Delete category"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
        body={
          affected === 0 ? (
            <span>No products use this category. Safe to remove.</span>
          ) : (
            <div className="flex flex-col gap-2">
              <span>
                <b>{affected}</b> product{affected !== 1 && "s"} still use this
                category. Move {affected === 1 ? "it" : "them"} to:
              </span>
              <select
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="input"
              >
                <option value="">Select a category…</option>
                {reassignOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )
        }
      />
    </div>
  );
}
