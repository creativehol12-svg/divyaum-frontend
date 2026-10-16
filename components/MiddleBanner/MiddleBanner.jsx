// components/MiddleBanner/MiddleBanner.jsx

import Image from "next/image";
import Link from "next/link";
import styles from "./MiddleBanner.module.scss";

export default function MiddleBanner({
  image,
  alt = "Banner",
  priority = false,
  linkUrl = "",
}) {
  if (!image) return null;

  const content = (
    <div className={styles.banner}>
      <Image
        src={image}
        alt={alt}
        fill
        priority={priority}
        className={styles.image}
        sizes="100vw"
      />
    </div>
  );

  return (
    <section className={styles.bannerWrapper}>
      {linkUrl ? (
        <Link
          href={linkUrl}
          className={styles.link}
          target={linkUrl.startsWith("http") ? "_blank" : undefined}
          rel={linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
}
