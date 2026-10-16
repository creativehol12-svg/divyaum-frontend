import styles from "./VisionSection.module.scss";

export default function VisionSection({ vision }) {
  if (!vision?.pillars?.length) {
    return null;
  }

  const { kicker, title, description, pillars } = vision;

  return (
    <section className={styles.visionSection} aria-label={kicker || "Our vision"}>
      <div className="container">
        <div className={styles.sectionHeader}>
          {/* {kicker ? <p className={styles.sectionKicker}>{kicker}</p> : null} */}
          {title ? <h2 className={styles.sectionTitle}>{title}</h2> : null}
          {description ? <p className={styles.sectionDesc}>{description}</p> : null}
        </div>
        <div className={styles.valuesGrid}>
          {pillars.map((item) => (
            <div key={item.title} className={styles.valueCard}>
              <img src={item.icon} width={60} height={60} className={styles.valueIcon}/>
              <h3 className={styles.valueTitle}>{item.title}</h3>
              <p className={styles.valueDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
