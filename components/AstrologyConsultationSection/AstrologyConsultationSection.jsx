import styles from "./AstrologyConsultationSection.module.scss";
import Button from "@/components/Button";

export default function AstrologyConsultationSection({ consultations }) {
  return (
    <section id="consultations" className={styles.section} aria-label="Astrology consultations">
      <div className="container">
        <header className={styles.header}>
          <span className={styles.deco} aria-hidden="true">❧</span>
          <h2 className={styles.sectionTitle}>Popular Consultation Plans</h2>
          <span className={styles.deco} aria-hidden="true">❧</span>
        </header>

        <div className={styles.grid}>
          {consultations.map((item) => (
            <article key={item.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{item.title}</h3>

              <div className={styles.metaRow}>
                <div className={styles.priceWrap}>
                  <span className={styles.price}>₹ {item.price}</span>
                  <span className={styles.oldPrice}>₹ {item.oldPrice}</span>
                </div>
                <span className={styles.duration}>{item.duration}</span>
              </div>

              <Button as="a" variant="unstyled" className={styles.cardButton} href="#contact">
                Consult Now <span className={styles.arrowSmall} aria-hidden="true">›</span>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
