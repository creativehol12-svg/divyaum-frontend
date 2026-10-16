import Link from "next/link";
import styles from "./Footer.module.scss";
import {
  PHONE_DISPLAY,
  EMAIL,
  TEL_HREF,
  MAILTO_HREF,
  WHATSAPP_HREF,
  SOCIAL,
} from "@/lib/contact";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <section className={styles.brandBlock}>
          {/* <p className={styles.brand}>DivyaVani</p> */}
          <img
            src="/icon/divyaum logo.png"
            alt="DivyaVani Logo"
            className={styles.logo}
          />
          <div className={styles.badges}>
            <span className={styles.badge}>Shraddha</span>
            <span className={styles.badge}>Samarpan</span>
            <span className={styles.badge}>Shakti</span>
          </div>
          <p className={styles.copy}>
            Authentic online pooja, trusted astrology guidance, and sacred
            essentials delivered with devotion.
          </p>
          <div className={styles.social} aria-label="Follow us">
            <a
              className={styles.socialLink}
              href={SOCIAL.instagram}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
              </svg>
            </a>
            <a
              className={styles.socialLink}
              href={SOCIAL.linkedin}
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.447 20.452H16.89V14.87c0-1.331-.027-3.043-1.854-3.043-1.854 0-2.137 1.445-2.137 2.944v5.681H9.341V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.604 0 4.269 2.372 4.269 5.456v6.285zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              className={styles.socialLink}
              href={SOCIAL.youtube}
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M22 8.2s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.1-1C15.5 4.6 12 4.6 12 4.6h0s-3.5 0-6.9.3c-.4 0-1.3 0-2.1 1C2.2 6.6 2 8.2 2 8.2S2 10 2 11.8v.5C2 13.5 2.2 15.3 2.2 15.3s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.4.3 7.4.3s3.5 0 6.9-.3c.4 0 1.3 0 2.1-1 .6-.7.8-2.3.8-2.3s.2-1.8.2-3.6v-.5c0-1.8-.2-3.6-.2-3.6z"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
                <path d="M10 14l5-3-5-3v6z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </section>

        <section className={styles.column} aria-label="Quick links">
          <p className={styles.miniTitle}>Quick Links</p>
          <Link className={styles.link} href="/">
            Home
          </Link>
          <Link className={styles.link} href="/about-us">
            About Us
          </Link>
          <Link className={styles.link} href="/online-pooja">
            Online Pooja
          </Link>
          <Link className={styles.link} href="/online-astrology">
            Online Astrology
          </Link>
          <Link className={styles.link} href="/divya-store">
            Divya Store
          </Link>
        </section>

        <section className={styles.column} aria-label="Support links">
          <p className={styles.miniTitle}>Support</p>
          {/* <a className={styles.link} href="#top">
            Back to top
          </a> */}
          <a className={styles.link} href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
            Contact
          </a>
          <a className={styles.link} href="/faq">
            FAQ
          </a>
          <a className={styles.link} href="/privacy-policy">
            Privacy Policy
          </a>
          <a className={styles.link} href="/terms-conditions">
            Terms &amp; Conditions
          </a>
          <a className={styles.link} href="/shipping-return-policy">
            Shipping &amp; Return Policy
          </a>
        </section>

        <section className={styles.contactCard}>
          <p className={styles.miniTitle}>Need Help With Booking?</p>
          <p className={styles.contactText}>
            Talk to our support team for pooja recommendations and slot
            guidance.
          </p>
          <a className={styles.phone} href={TEL_HREF}>
            {PHONE_DISPLAY}
          </a>
          <p className={styles.callTime}>Call time 11am to 6pm</p>
          <a className={styles.email} href={MAILTO_HREF}>
            {EMAIL}
          </a>
        </section>
      </div>

      <div className={`container ${styles.bottom}`}>
        <small className={styles.legal}>
          &copy; {year} Divyaum. All rights reserved.
        </small>

        <p className={styles.bottomLine}>
          Made for faith-led digital experiences.
        </p>
      </div>
    </footer>
  );
}
