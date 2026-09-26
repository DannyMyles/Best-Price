/** Same rules as the storefront's `slugify()` (src/lib/format.ts). */
export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Folder/file-safe name, same as pricehub's restructure_by_item.py `safe()`. */
export function safeName(name) {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/[\x00-\x1f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
