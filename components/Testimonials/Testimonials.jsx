"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Testimonials.module.scss";
import testimonials from "@/data/testimonials.json";

function Stars({ rating }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? styles.starOn : styles.starOff}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const total = testimonials.length;

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive(p => (p + 1) % total), 4000);
  }, [total]);

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [startTimer]);

  const handleDot = (i) => { setActive(i); startTimer(); };

  // compute position relative to active (-3 to +3)
  const getPos = (i) => {
    let pos = i - active;
    if (pos > total / 2) pos -= total;
    if (pos < -total / 2) pos += total;
    return pos;
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        
        <h2 className={styles.title}>Testimonials</h2>
      </div>

      <div className={styles.stage}>
        {testimonials.map((t, i) => {
          const pos = getPos(i);
          const abs = Math.abs(pos);
          if (abs > 2) return null;
          const isActive = pos === 0;

          return (
            <div
              key={t.id}
              className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
              style={{
                "--x": `${pos * 260}px`,
                "--scale": isActive ? 1 : abs === 1 ? 0.82 : 0.68,
                // "--blur": isActive ? "0px" : abs === 1 ? "3px" : "6px",
                "--opacity": isActive ? 1 : abs === 1 ? 0.55 : 0.3,
                "--z": isActive ? 10 : abs === 1 ? 6 : 3,
              }}
              onClick={!isActive ? () => handleDot(i) : undefined}
            >
              <div className={styles.imgWrap}>
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.name}
                    className={styles.cardImage}
                  />
                ) : (
                  <div className={styles.imgBg}>
                    <span className={styles.initials}>{t.initials}</span>
                  </div>
                )}
              </div>
              <p
                className={styles.cardText}
                title={isActive ? t.text : undefined}
              >
                {t.text}
              </p>
              <Stars rating={t.rating} />
              <div className={styles.reviewer}>
                <p className={styles.reviewerName}>{t.name}</p>
                <p className={styles.reviewerRole}>{t.role}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.dots}>
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
            onClick={() => handleDot(i)}
            aria-label={`Testimonial ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}