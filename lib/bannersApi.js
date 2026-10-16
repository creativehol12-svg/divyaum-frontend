import { getApiBaseUrl } from "./productsApi";

/**
 * @param {string} page - home | divya-store | online-astrology | online-pooja
 * @returns {Promise<Record<string, unknown>>}
 */
export async function fetchPageBanners(page) {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/banners?page=${page}`, {
      cache: "no-store",
    });
    if (!response.ok) return {};
    const json = await response.json();
    return json && typeof json === "object" ? json : {};
  } catch (err) {
    console.warn(`Failed to fetch banners for ${page}:`, err?.message);
    return {};
  }
}

/** @param {unknown} slot */
export function getBannerImage(slot, fallback = "") {
  if (slot && typeof slot === "object" && slot.image) {
    return slot.image;
  }
  return fallback;
}

/** @param {unknown} slot */
export function getBannerLink(slot) {
  if (slot && typeof slot === "object" && slot.linkUrl) {
    return slot.linkUrl;
  }
  return "";
}