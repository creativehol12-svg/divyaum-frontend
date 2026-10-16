import { getApiBaseUrl } from "@/lib/productsApi";

export function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getSearchTypeLabel(type) {
  const labels = {
    pooja: "Online Pooja",
    product: "Divya Store",
    astrologer: "Astrologer",
    pandit: "Astrologer",
  };
  return labels[String(type ?? "").toLowerCase()] || "Result";
}

/**
 * @param {{ type: string, id: string, name: string, slug?: string }} item
 * @returns {string | null}
 */
export function getSearchResultHref(item) {
  const id = item?.id ?? "";
  const name = item?.name ?? "";
  if (!id) return null;

  const base = slugify(name);
  const type = String(item?.type ?? "").toLowerCase();

  switch (type) {
    case "pooja":
      return item.slug || base
        ? `/online-pooja/${item.slug || base}`
        : null;
    case "product":
      return item.slug || base
        ? `/divya-store/${item.slug || base}`
        : null;
    case "astrologer":
    case "pandit":
      return item.slug || base
        ? `/online-astrology/${item.slug || base}`
        : null;
    default:
      return null;
  }
}

/**
 * @param {string} query
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ type: string, id: string, name: string }[]>}
 */
export async function fetchSearchResults(query, options = {}) {
  const q = String(query ?? "").trim();
  if (q.length < 2) return [];

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/search?q=${encodeURIComponent(q)}`;
  const response = await fetch(url, {
    cache: "no-store",
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Search failed (${response.status})`);
  }

  const json = await response.json();
  return Array.isArray(json) ? json : [];
}
