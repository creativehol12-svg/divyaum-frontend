import React from "react";
import Image from "next/image";
import styles from "./AboutUs.module.scss";
import Link from "next/link";

export default function AboutUs({ stats, isDetailed }) {
  return (
    <section className={styles.aboutSection} aria-label="About us">
      <div className="container">
        <div className={styles.aboutGrid}>
          <div className={styles.aboutImage}>
            <Image
              src="/images/about-section.jpeg"
              alt="test"
              fill
              className={styles.aboutImg}
              // sizes={{overfit: "cover"}}
            />
            <div
              className={`${styles.aboutImageBadge} styles.${isDetailed ? "bigimage" : "smallImage"}`}
            >
              <span className={styles.badgeNum}>2025</span>
              <span className={styles.badgeLabel}>Founded</span>
            </div>
          </div>
          <div className={styles.aboutContent}>
            <p className={styles.sectionKicker}>Who We Are</p>
            <h2 className={styles.sectionTitle}>
              Bringing Sanatan to Your Home
            </h2>
            <p className={styles.aboutText}>
              Divyaum is founded on the fundamental belief that every
              individual merits access to divine grace, irrespective of their
              geographical location.
            </p>
            <p className={styles.aboutText}>
              In 2025, the founding members endeavoured to establish a platform
              grounded in the tenets of Sanatan wisdom and legacy, respecting
              the sanctity of ancient rituals while leveraging contemporary
              technology.
            </p>
            <p className={styles.aboutText}>
              Currently, we are recognised as India's most trusted online
              platform, curating content, collaborating with pandits and
              temples, and committed communities to provide authentic spiritual
              experiences directly to one's residence.
            </p>

            <div className={styles.statsRow}>
              {isDetailed &&
                stats.map((s) => (
                  <div key={s.label} className={styles.statItem}>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                ))}
              {!isDetailed && (
                <Link href="/about-us" className={styles.cta}>
                  Read more
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
