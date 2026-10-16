import { getApiBaseUrl } from "./productsApi";

/**
 * Extract a YouTube video id from common watch / short / embed / youtu.be URLs.
 * @param {string} url
 * @returns {string | null}
 */
export function extractYoutubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = parsed.searchParams.get("v");
      if (v) return v;

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
        return parts[1] || null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Map API youtube video docs to FeaturedVideos card shape.
 * @param {unknown} doc
 */
export function mapYoutubeVideo(doc) {
  if (!doc || typeof doc !== "object") return null;
  const id = doc._id || doc.id;
  if (!id || !doc.thumbnailUrl || !doc.title || !doc.youtubeUrl) return null;

  const youtubeUrl = String(doc.youtubeUrl);
  const videoId = extractYoutubeVideoId(youtubeUrl);
  if (!videoId) return null;

  return {
    id: String(id),
    title: String(doc.title),
    thumbnail: String(doc.thumbnailUrl),
    thumbnailAlt: String(doc.title),
    youtubeUrl,
    videoId,
  };
}

/**
 * @returns {Promise<Array<{ id: string, title: string, thumbnail: string, thumbnailAlt: string, youtubeUrl: string, videoId: string }>>}
 */
export async function fetchYoutubeVideos() {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/youtube-videos`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const json = await response.json();
    if (!Array.isArray(json)) return [];
    return json.map(mapYoutubeVideo).filter(Boolean);
  } catch (err) {
    console.warn("Failed to fetch YouTube videos:", err?.message);
    return [];
  }
}
