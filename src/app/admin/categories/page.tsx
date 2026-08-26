"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus } from "lucide-react";
import { fetchAllCategories, upsertCategory, removeCategory } from "@/lib/firebase/categories";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { slugify } from "@/lib/format";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import type { Category } from "@/lib/types";

const emptyForm = { slug: "", name: "", shortName: "", description: "", icon: "laptop" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [form, setForm] = useState(emptyForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    if (!isFirebaseConfigured) return;
    fetchAllCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(c: Category) {
    setEditingSlug(c.slug);
    setForm({ slug: c.slug, name: c.name, shortName: c.shortName, description: c.description, icon: c.icon });
  }

  function resetForm() {
    setEditingSlug(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const slug = editingSlug ?? (form.slug.trim() || slugify(form.name));
    try {
      await upsertCategory(slug, {
        slug: slug as Category["slug"],
        name: form.name.trim(),
        shortName: form.shortName.trim() || form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        active: true,
      });
      resetForm();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Delete this category?")) return;
    await removeCategory(slug);
    setCategories((prev) => prev.filter((c) => c.slug !== slug));
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
        Firebase isn&apos;t configured — add your project credentials to{" "}
        <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">.env.local</code> to manage categories.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-6 text-xl font-semibold text-ink">Categories</h1>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((c) => (
                  <tr key={c.slug}>
                    <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                    <td className="px-4 py-3 text-muted">{c.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => startEdit(c)} className="text-muted hover:text-brand">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(c.slug)} className="text-muted hover:text-red-500">
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
          {editingSlug ? "Edit category" : "Add category"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
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
            onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
            className="input"
          />
          <textarea
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="input"
          />
          <select
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            className="input"
          >
            {["tablet", "laptop", "monitor", "puzzle", "cpu"].map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <AnimatedButton type="submit" variant="primary" disabled={saving} className="flex-1 disabled:opacity-60">
              <Plus className="h-4 w-4" /> {editingSlug ? "Save" : "Add"}
            </AnimatedButton>
            {editingSlug && (
              <AnimatedButton type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </AnimatedButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
