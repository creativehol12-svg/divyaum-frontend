"use client";

import { useEffect, useState } from "react";
import styles from "./Hero.module.scss";

const FALLBACK_SLIDES = [
  { image: "/banner/herosectionimage.png", linkUrl: "" },
  { image: "/banner/herosectionimage2.png", linkUrl: "" },
  { image: "/banner/herosectionimage3.png", linkUrl: "" },
  { image: "/banner/herosectionimage4.png", linkUrl: "" },
  { image: "/banner/herosectionimage5.png", linkUrl: "" },
];

export default function Hero({ banners = [] }) {
  const slides =
    banners.length > 0
      ? banners.map((b) => ({
          image: b.image,
          linkUrl: b.linkUrl || "",
          id: b._id,
        }))
      : FALLBACK_SLIDES;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const renderSlide = (slide, i) => {
    const isActive = i === index;
    const bgClass = `${styles.bg} ${isActive ? styles.active : ""}`;
    const bgStyle = { backgroundImage: `url(${slide.image})` };

    if (slide.linkUrl) {
      return (
        <a
          key={slide.id || slide.image}
          href={slide.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${bgClass} ${styles.link}`}
          style={bgStyle}
          aria-hidden={!isActive}
          tabIndex={isActive ? 0 : -1}
        />
      );
    }

    return (
      <div
        key={slide.id || slide.image}
        className={bgClass}
        style={bgStyle}
        aria-hidden="true"
      />
    );
  };

  return (
    <section id="top" className={styles.hero}>
      <span id="hero-sentinel" className={styles.sentinel} aria-hidden="true" />

      <div className={styles.bgContainer} aria-hidden={slides.every((s) => !s.linkUrl)}>
        {slides.map(renderSlide)}
      </div>
    </section>
  );
}
