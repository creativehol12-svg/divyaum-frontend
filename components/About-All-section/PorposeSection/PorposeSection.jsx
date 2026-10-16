import styles from "./PorposeSection.module.scss";

const purposeChips = ["Shraddha", "Samarpan", "Shakti"];

export default function PorposeSection() {
    return (
        <section className={styles.purposeSection} aria-label="Our purpose">
            <div className="container">
                <div className={styles.purposeInner}>
                    <div className={styles.purposeText}>
                        
                        <h2 className={styles.purposeTitle}>Why We Exist</h2>
                        <div className={styles.chipRow} role="list" aria-label="Our pillars">
                          {purposeChips.map((chip) => (
                            <span key={chip} className={styles.chip} role="listitem">
                              {chip}
                            </span>
                          ))}
                        </div>
                        <p className={styles.purposeDesc}>
                           These are not just words, but are the pillars of a life lived with purpose.
                         </p>
                        <p className={styles.purposeDesc}>
                            In every bead, every flame, every sacred mantra chanted, every ahuti offered, we bring to you the 5000 years of Sanatan wisdom and legacy. 
Welcome to Divyaum. Where Sanatan is not the past. It is how you begin today. </p>
                    </div>
                    <div className={styles.purposeQuote} aria-label="Purpose image">
                        <img
                          src="/images/why_we_exist.jpeg"
                          alt="Why we exist at Divyaum"
                          className={styles.purposeImage}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

