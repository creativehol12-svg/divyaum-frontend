import Link from "next/link";

/**
 * Page top hero that keeps existing CSS class visuals.
 * When linkUrl is set, the whole banner becomes clickable.
 */
export default function PageHeroBanner({
  className,
  ariaLabel,
  image = "",
  linkUrl = "",
}) {
  const style = image ? { backgroundImage: `url(${image})` } : undefined;
  const trimmedLink = typeof linkUrl === "string" ? linkUrl.trim() : "";
  const isExternal = /^https?:\/\//i.test(trimmedLink);

  if (!trimmedLink) {
    return (
      <section
        id="top"
        className={className}
        aria-label={ariaLabel}
        style={style}
      />
    );
  }

  const linkStyle = {
    ...style,
    cursor: "pointer",
    display: "block",
    textDecoration: "none",
    color: "inherit",
  };

  if (isExternal) {
    return (
      <a
        id="top"
        className={className}
        aria-label={ariaLabel}
        style={linkStyle}
        href={trimmedLink}
        target="_blank"
        rel="noopener noreferrer"
      />
    );
  }

  return (
    <Link
      id="top"
      className={className}
      aria-label={ariaLabel}
      style={linkStyle}
      href={trimmedLink}
    />
  );
}
