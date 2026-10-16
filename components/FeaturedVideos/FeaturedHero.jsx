import Image from "next/image";
import styles from "./FeaturedVideos.module.scss";

export default function FeaturedHero({ video, onPlay }) {
  if (!video) return null;

  return (
    <article className={styles.hero} aria-label={`Featured video: ${video.title}`}>
      <div key={video.id} className={styles.heroInner}>
        <div
          className={styles.heroMedia}
          onClick={onPlay}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPlay?.();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Play ${video.title}`}
        >
          <Image
            src={video.thumbnail}
            alt={video.thumbnailAlt || video.title}
            fill
            priority
            className={styles.heroImage}
            sizes="(max-width: 1024px) 100vw, 65vw"
          />
          <span className={styles.heroOverlay} aria-hidden="true" />
          <span className={styles.heroTitleOverlay}>{video.title}</span>

          <button
            type="button"
            className={`${styles.cardPlayBtn} ${styles.cardPlayBtnHero}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            aria-label={`Play ${video.title}`}
          >
            <span className={styles.cardPlayIcon} aria-hidden="true">
              ▶
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
