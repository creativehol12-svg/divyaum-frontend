import { WEBSITE_URL } from "@/lib/contact";

const DEFAULT_OG_WIDTH = 1200;
const DEFAULT_OG_HEIGHT = 630;

/**
 * Flatten candidates (strings / arrays / nested) and return usable image strings.
 */
export function collectImageCandidates(...candidates) {
  const out = [];

  const visit = (value) => {
    if (value == null || value === false) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value === "object") {
      visit(value.url ?? value.src ?? value.image ?? value.href);
      return;
    }
    const src = String(value).trim();
    if (src) out.push(src);
  };

  candidates.forEach(visit);
  return out;
}

/** True only for remote http(s) / protocol-relative URLs — not site-local public paths. */
export function isRemoteImageUrl(image) {
  const src = String(image ?? "").trim();
  return /^https?:\/\//i.test(src) || src.startsWith("//");
}

/**
 * Normalize a remote image URL for crawlers (WhatsApp, FB, X).
 * Local/public paths are rejected — share previews must use CDN/S3 URLs only.
 */
export function toAbsoluteImageUrl(image) {
  let src = String(image ?? "").trim();
  if (!src || !isRemoteImageUrl(src)) return null;

  if (src.startsWith("//")) {
    src = `https:${src}`;
  }

  try {
    const url = new URL(src);
    if (url.protocol === "http:" && !/^(localhost|127\.0\.0\.1)/i.test(url.hostname)) {
      url.protocol = "https:";
    }
    return url.toString();
  } catch {
    return encodeURI(src);
  }
}

/**
 * First valid remote absolute image URL from candidates (no local fallbacks).
 */
export function resolveShareImageUrl(images) {
  for (const candidate of collectImageCandidates(images)) {
    const absolute = toAbsoluteImageUrl(candidate);
    if (absolute) return absolute;
  }
  return null;
}

function toAbsolutePageUrl(path, siteOrigin = WEBSITE_URL) {
  const base = String(siteOrigin ?? "").replace(/\/$/, "");
  if (!base || !path) return undefined;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  try {
    return new URL(normalized, `${base}/`).toString();
  } catch {
    return `${base}${normalized}`;
  }
}

/**
 * Attach Open Graph / Twitter preview images from remote URLs only.
 * If no remote image is available, metadata is returned unchanged (no local image).
 */
export function withSocialShareImages(metadata, image, options = {}) {
  const {
    siteOrigin = WEBSITE_URL,
    alt = metadata?.title || "Divyaum",
    width = DEFAULT_OG_WIDTH,
    height = DEFAULT_OG_HEIGHT,
    path,
  } = options;

  const absoluteImage = resolveShareImageUrl(image);
  if (!absoluteImage) return metadata;

  const pageUrl = toAbsolutePageUrl(path, siteOrigin);

  const ogImage = {
    url: absoluteImage,
    width,
    height,
    alt: String(alt || "Divyaum"),
  };

  if (absoluteImage.startsWith("https:")) {
    ogImage.secureUrl = absoluteImage;
  }

  const mime = guessImageMime(absoluteImage);
  if (mime) ogImage.type = mime;

  return {
    ...metadata,
    openGraph: {
      ...(metadata.openGraph || {}),
      type: metadata.openGraph?.type || "website",
      siteName: metadata.openGraph?.siteName || "Divyaum",
      title: metadata.openGraph?.title || metadata.title,
      description: metadata.openGraph?.description || metadata.description,
      ...(pageUrl ? { url: pageUrl } : {}),
      images: [ogImage],
    },
    twitter: {
      ...(metadata.twitter || {}),
      card: "summary_large_image",
      title: metadata.twitter?.title || metadata.title,
      description: metadata.twitter?.description || metadata.description,
      images: [absoluteImage],
    },
  };
}

/**
 * One-shot helper for product / astrologer / pooja detail share metadata.
 */
export function buildDetailShareMetadata({
  title,
  description,
  image,
  path,
  siteOrigin = WEBSITE_URL,
}) {
  return withSocialShareImages(
    {
      title,
      description: description || title,
    },
    image,
    { siteOrigin, alt: title, path },
  );
}

function guessImageMime(url) {
  const clean = String(url).split("?")[0].toLowerCase();
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".gif")) return "image/gif";
  if (clean.endsWith(".svg")) return "image/svg+xml";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  return undefined;
}
