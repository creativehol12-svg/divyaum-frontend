import Image from "next/image";
import styles from "./FeaturedVideos.module.scss";

export default function FeaturedSideCard({ video, onPlay }) {
  return (
    <article className={styles.sideCard}>
      <div
        className={styles.sideThumbWrap}
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
          alt=""
          fill
          className={styles.sideThumb}
          sizes="160px"
        />
        <span className={styles.sideTitleOverlay}>{video.title}</span>

        <button
          type="button"
          className={`${styles.cardPlayBtn} ${styles.cardPlayBtnSide}`}
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
    </article>
  );
}
