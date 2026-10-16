import Image from "next/image";
import Link from "next/link";
import OfferBadge from "@/components/OfferBadge/OfferBadge";
import Button from "@/components/Button";
import styles from "./PoojaCard.module.scss";

function renderStars(rating) {
  const normalized = Number(rating);
  const clamped = Number.isFinite(normalized) ? Math.max(0, Math.min(5, normalized)) : 0;
  const fullStars = Math.round(clamped);

  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={`${index}-${fullStars}`}
      className={index < fullStars ? styles.starActive : styles.star}
      aria-hidden="true"
    >
      ★
    </span>
  ));
}

export default function PoojaCard({
  title,
  image,
  imagePosition = "center",
  durationMins,
  shortDescription = "",
  badge,
  href = "#contact",
  location = "",
}) {
  return (
    <Link className={styles.card} href={href} aria-label={`Open details for ${title}`}>
      <article>
        <div className={styles.media}>
          {badge ? <OfferBadge label={badge} /> : null}
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              className={styles.image}
              sizes="(max-width: 768px) 80vw, 260px"
              style={{ objectPosition: imagePosition }}
            />
          ) : null}
        </div>

        <div className={styles.body}>
          <div  className={styles.Partscontainer}>

          <h3 className={styles.title}>{title}</h3>

          {shortDescription && (
            <div className={styles.shortDescription}>{shortDescription}</div>
          )}
          </div>
          <div className={styles.Partscontainer}>

          <div className={styles.metaRow} aria-label="Duration and location">
            <span className={styles.duration}>
              <span className={styles.durationIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm1-13a1 1 0 0 0-2 0v5a1 1 0 0 0 .29.71l3 3a1 1 0 1 0 1.42-1.42L13 11.59Z" />
                </svg>
              </span>
              <span className={styles.durationText}>
                {/* <span className={styles.durationLabel}>Duration</span> */}
                <span className={styles.durationValue}>{durationMins} mins</span>
              </span>
            </span>
            <span className={styles.locationWrap} aria-label="Location">
              <span className={styles.locationIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C7.03 2 3 6.03 3 11c0 5.25 7.2 10.45 8.09 11.09a1 1 0 0 0 1.18 0C13.8 21.45 21 16.25 21 11c0-4.97-4.03-9-9-9Zm0 17.88C9.14 17.07 5 13.61 5 11c0-3.87 3.13-7 7-7s7 3.13 7 7c0 2.61-4.14 6.07-7 8.88ZM12 6a5 5 0 1 0 0 10A5 5 0 0 0 12 6Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="#b94918"/></svg>
              </span>
              <span className={styles.locationText}>{location}</span>
            </span>
          </div>

          <Button as="span" variant="unstyled" className={styles.button}>
            Book Now <span className={styles.arrow} aria-hidden="true">›</span>
          </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}

