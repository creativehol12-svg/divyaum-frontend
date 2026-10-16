"use client"
import Image from "next/image";
import styles from "./ReviewsSection.module.scss";
import Button from "@/components/Button";
import { useState } from "react";
import VideoModal from "@/components/VideoModel/VideoModel";

const reviews = [
  {
    name: "Pooja Sharma",
    image: "/pooja/pooja-2.png",
    rating: 5,
    text: "The livestreamed pooja connected us deeply. Pandit ji was very knowledgeable. We felt blessed and peaceful at home.",
  },
  {
    name: "Swaminathan R",
    image: "/pooja/pooja-3.png",
    rating: 5,
    text: "Love Marriage, Career Guidance. Very calm and clear guidance with a warm experience throughout.",
  },
  {
    name: "Aarti Verma",
    image: "/pooja/pooja-4.png",
    rating: 5,
    text: "The experience felt personal, authentic, and very peaceful. The guidance was clear and reassuring.",
  },
];

function Stars({ count = 5, className = "" }) {
  return <span className={`${styles.stars} ${className}`.trim()}>{"★".repeat(count)}</span>;
}

export default function ReviewsSection() {
  const [openVideo, setOpenVideo] = useState(false);
  return (
    <section className={styles.section} aria-label="Customer reviews">
      <div className="container">
        <header className={styles.header}>
          <span className={styles.deco} aria-hidden="true">
            ❧
          </span>
          <h2 className={styles.title}>Customer Reviews</h2>
          <span className={styles.deco} aria-hidden="true">
            ❧
          </span>
        </header>

        <div className={styles.grid}>
          <article className={styles.featured} aria-label="Featured review video card">
            <div className={styles.featureMedia}>
              <Image
                src="/pooja/pooja-1.png"
                alt="Customer review preview"
                fill
                className={styles.featureImage}
                sizes="(max-width: 900px) 100vw, 55vw"
              />
              <div className={styles.featureOverlay} aria-hidden="true" />
              <Button
                variant="unstyled"
                className={styles.playButton}
                type="button"
                aria-label="Play review video"
                onClick={() => setOpenVideo(true)}
              >
                <span className={styles.playIcon} aria-hidden="true">
                  ▶
                </span>
              </Button>
              <Stars className={styles.featureStars} />
            </div>

            <div className={styles.featureFooter} aria-hidden="true">
              <Stars />
            </div>
          </article>

          <div className={styles.reviewList}>
            {reviews.map((review) => (
              <article key={review.name} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.avatarWrap} aria-hidden="true">
                    <Image src={review.image} alt="" width={52} height={52} className={styles.avatar} />
                  </span>

                  <div className={styles.reviewHead}>
                    <h3 className={styles.name}>{review.name}</h3>
                    <Stars count={review.rating} className={styles.inlineStars} />
                  </div>
                </div>

                <p className={styles.text}>{review.text}</p>
              </article>
            ))}
          </div>
          <VideoModal
            isOpen={openVideo}
            onClose={() => setOpenVideo(false)}
            videoId="adyjwFgXRNY" 
          />
        </div>
      </div>
    </section>
  );
}
