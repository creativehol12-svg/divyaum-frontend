"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Herocarousel.module.scss";

export default function HeroCarousel({ images, alt, className }) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  if (!images || images.length === 0) return null;

  return (
    <div className={className ? `${styles.carousel} ${className}` : styles.carousel}>
      {/* Main Image */}
      <div className={styles.mediaWrap}>
        {images.map((src, i) => (
          <div
            key={src + i}
            className={`${styles.slide} ${i === current ? styles.slideActive : ""}`}
          >
            <Image
              src={src}
              alt={`${alt} ${i + 1}`}
              fill
              priority={i === 0}
              className={styles.image}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
        ))}

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous image">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next image">
              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className={styles.counter}>
            {current + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Dots */}
      {images.length > 1 && (
        <div className={styles.dots}>
          {images.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}