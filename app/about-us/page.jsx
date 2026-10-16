// "use client";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.scss";
import Button from "@/components/Button";
import PorposeSection from "@/components/About-All-section/PorposeSection/PorposeSection";
import AboutUs from "@/components/About-All-section/AboutSection/AboutUs";
import VisionSection from "@/components/About-All-section/VisionSection/VisionSection";
import data from "@/data/about-data.json";
import FoundersSection from "@/components/About-All-section/Founders.jsx/FoundersSection";
import { WHATSAPP_HREF } from "@/lib/contact";

export const metadata = {
  title: "About Divyaum | Divyaum",
  description:
    "Consult trusted jyotish acharyas online for kundli, marriage, career, and remedies.",
};
const { missions } = data;

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* ── BANNER ── */}
        <section className={styles.banner} aria-label="About DivyaVani">
          <div className={styles.bannerBg}>
            <Image
              src="/banner/about-us.png"
              alt=""
              fill
              className={styles.bannerBgImg}
              priority
            />
          </div>
          <div className={styles.bannerOverlay} />
          <div className={`container ${styles.bannerContainer}`}>
            <div className={styles.bannerContent}>
              <p className={styles.bannerKicker}>Our Story</p>
              <h1 className={styles.bannerTitle}>About Divyaum</h1>
              <p className={styles.bannerSubtitle}>
                We are India’s only platform that strives to revive Sanatan by
                sharing its wisdom, teaching, and gyaan through content, puja,
                astrology and products to millions of homes across the
                world.{" "}
              </p>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <span>About Us</span>
              </nav>
            </div>
          </div>
        </section>

        <AboutUs stats={data.stats} isDetailed={true} />
        <PorposeSection />

        <VisionSection vision={data.vision} />

        {/* ── MISSION ── */}
        <section className={styles.missionSection} aria-label="Our mission">
          <div className="container">
            <div className={styles.missionLayout}>
              <div className={styles.missionLeft}>
                <p className={styles.sectionKicker}>Our Mission</p>
                <h2 className={styles.missionBigTitle}>8 Pillars</h2>
                <p className={styles.sectionDesc}>
                  These eight commitments guide every decision we make and every
                  service we offer.
                </p>
              </div>

              <div className={styles.missionRight}>
                <div className={styles.missionGrid}>
                  {missions.map((m) => (
                    <div key={m.num} className={styles.missionCard}>
                      <span className={styles.missionNum}>{m.num}</span>
                      <h3 className={styles.missionTitle}>{m.title}</h3>
                      <p className={styles.missionDesc}>{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <FoundersSection founders={data.founders} />

        {/* ── CTA ── */}
        <section className={styles.ctaSection} aria-label="Call to action">
          <div className="container">
            <div className={styles.ctaCard}>
              <p className={styles.ctaKicker}>Begin Your Journey</p>
              <h2 className={styles.ctaTitle}>
                Experience the Divine, From Anywhere
              </h2>
              <p className={styles.ctaDesc}>
                Book a pooja today and let our verified pandits guide you
                through a sacred, authentic ritual experience.
              </p>
              <div className={styles.ctaActions}>
                <Button
                  as={Link}
                  variant="unstyled"
                  href="/online-pooja"
                  className={styles.ctaPrimary}
                >
                  Explore Poojas <span aria-hidden="true">›</span>
                </Button>
                <Button
                  as={Link}
                  variant="unstyled"
                  href={WHATSAPP_HREF}
                  target="_blank"
                  className={styles.ctaSecondary}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
