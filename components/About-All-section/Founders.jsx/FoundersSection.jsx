// FoundersSection.jsx

import React from "react";
import Image from "next/image";
import styles from "./FoundersSection.module.scss";

export default function FoundersSection({ founders }) {
  return (
    <section className={styles.foundersSection} aria-label="Our founders">
      <div className="container">
        {/* HEADER */}
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>The Founders</p>

          <h2 className={styles.sectionTitle}>The Minds Behind the Mission</h2>

          <p className={styles.sectionDesc}>
            Dreamers who dared to ask: what if every devotee could access
            divine grace from anywhere in the world?
          </p>
        </div>

        {/* GRID */}
        <div className={styles.foundersGrid}>
          {founders.map((f) => (
            <article key={f.name} className={styles.founderCard}>
              {/* IMAGE */}
              <div className={styles.founderMedia}>
                <div className={styles.founderImageWrap}>
                  {f.image ? (
                    <Image
                      src={f.image}
                      alt={f.name}
                      fill
                      className={styles.founderImg}
                      sizes="(max-width:768px) 100vw, 40vw"
                    />
                  ) : (
                    <div className={styles.founderInitials}>{f.initials}</div>
                  )}
                </div>

                <div className={styles.founderDecor} aria-hidden="true" />
              </div>

              {/* CONTENT */}
              <div className={styles.founderBody}>
                <div className={styles.founderTop}>
                  <h3 className={styles.founderName}>{f.name}</h3>

                  <p className={styles.founderRole}>{f.role}</p>
                </div>

                <p className={styles.founderBio}>{f.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
