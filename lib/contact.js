// Centralized contact / brand information.
// Change any value here and it updates everywhere across the site.

// Phone number (raw, used for tel: and wa.me links — no spaces)
export const PHONE_NUMBER = "+919755590829";

// Phone number formatted for display
export const PHONE_DISPLAY = "+91 97555 90829";

// Support email
export const EMAIL = "hello@divyaum.com";

// Production fallbacks when the request host is unavailable
const DEFAULT_WEBSITE_URL = "https://www.divyaum.com";
const DEFAULT_WEBSITE_DISPLAY = "www.divyaum.com";

/**
 * Resolve the URL the site is currently being served on.
 * Prefer this in Server Components — top-level constants cannot see `window`
 * during SSR, so they always fell back to the production defaults.
 */
export async function getWebsite() {
  if (typeof window !== "undefined") {
    return {
      url: window.location.origin,
      display: window.location.host,
    };
  }

  try {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const host =
      headersList.get("x-forwarded-host") || headersList.get("host");

    if (host) {
      const isLocal =
        host.startsWith("localhost") ||
        host.startsWith("127.0.0.1") ||
        host.startsWith("[::1]");
      const protocol =
        headersList.get("x-forwarded-proto") || (isLocal ? "http" : "https");

      return {
        url: `${protocol}://${host}`,
        display: host,
      };
    }
  } catch {
    // headers() is only available in a request context
  }

  return {
    url: DEFAULT_WEBSITE_URL,
    display: DEFAULT_WEBSITE_DISPLAY,
  };
}

// Static production values (prefer getWebsite() when you need the live host)
export const WEBSITE_URL = DEFAULT_WEBSITE_URL;
export const WEBSITE_DISPLAY = DEFAULT_WEBSITE_DISPLAY;

// Ready-to-use link hrefs derived from the values above
export const TEL_HREF = `tel:${PHONE_NUMBER}`;
export const MAILTO_HREF = `mailto:${EMAIL}`;
export const WHATSAPP_HREF = `https://wa.me/${PHONE_NUMBER}`;

// Social media links
export const SOCIAL = {
  instagram: "https://www.instagram.com/_divyaum?igsh=a3hyZGtxYnhybnds",
  linkedin: "https://www.linkedin.com/company/house-of-param-dharam/",
  youtube: "https://www.youtube.com/@Divyaum-1",
};

// Bundled export for convenience
const CONTACT = {
  PHONE_NUMBER,
  PHONE_DISPLAY,
  EMAIL,
  WEBSITE_URL,
  WEBSITE_DISPLAY,
  TEL_HREF,
  MAILTO_HREF,
  WHATSAPP_HREF,
  SOCIAL,
};

export default CONTACT;
