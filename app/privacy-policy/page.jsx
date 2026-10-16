import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.scss";
import {
  PHONE_DISPLAY,
  EMAIL,
  TEL_HREF,
  MAILTO_HREF,
  WHATSAPP_HREF,
  getWebsite,
} from "@/lib/contact";

export const metadata = {
  title: "Privacy Policy | Divyaum",
  description:
    "Read how Divyaum collects, uses, and protects your information across online pooja, astrology, and store services.",
};

export default async function PrivacyPolicyPage() {
  const { url: WEBSITE_URL, display: WEBSITE_DISPLAY } = await getWebsite();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.updatedAt}>Effective Date: June 7, 2026</p>
          <p className={styles.meta}>
            Website:{" "}
            <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">
              {WEBSITE_DISPLAY}
            </a>{" "}
            | Contact:{" "}
            <a href={MAILTO_HREF}>{EMAIL}</a>
          </p>

          <div className={styles.content}>
            <h2>1. Introduction</h2>
            <p>
              Welcome to Divyaum (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We
              are India&apos;s trusted online spiritual platform offering Online Pooja
              bookings, Vedic Astrology consultations, sacred products through the
              Divya Store and an exclusive range of handcrafted products also. We are
              committed to protecting your personal information and your right to
              privacy.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you visit our website {WEBSITE_DISPLAY} and use our
              services. Please read this policy carefully. If you disagree with its
              terms, please discontinue use of the site.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Personal Information You Provide</h3>
            <p>
              When you register an account, book a pooja, consult an astrologer, or
              place an order, we may collect:
            </p>
            <ul>
              <li>Full name and date of birth</li>
              <li>Email address and mobile number</li>
              <li>
                Postal address (for product delivery and Prasad dispatch)
              </li>
              <li>
                Birth details (date, time, and place of birth) for Vedic Astrology
                consultations
              </li>
              <li>
                Payment information (processed securely through our payment gateway; we
                do not store card details)
              </li>
              <li>
                Preferences related to rituals, deities, or spiritual practices
              </li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <p>When you visit our website, we automatically collect certain information, including:</p>
            <ul>
              <li>IP address, browser type, and device information</li>
              <li>Pages visited, time spent on pages, and referring URLs</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>
              We may receive information from third-party services such as payment
              gateways (e.g., Razorpay), social media login providers, or analytics
              platforms.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your user account</li>
              <li>Process bookings for online poojas and astrology consultations</li>
              <li>
                Fulfil product orders and arrange delivery of Prasad and puja essentials
              </li>
              <li>Process payments securely through our payment gateway partner</li>
              <li>
                Send booking confirmations, reminders, and ritual updates via email or
                WhatsApp
              </li>
              <li>
                Personalise your experience and recommend relevant services or products
              </li>
              <li>Respond to customer support queries</li>
              <li>Comply with applicable laws and legal obligations</li>
              <li>Improve our website, services, and offerings based on usage data</li>
            </ul>

            <h2>4. Payment Processing</h2>
            <p>
              All payments on Divyaum are processed through a secure, PCI-DSS compliant
              payment gateway (such as Razorpay). We do not store, log, or have access to
              your full payment card details. Your financial information is encrypted and
              processed directly by our payment partner in accordance with their privacy
              and security policies.
            </p>

            <h2>5. Sharing Your Information</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties.
              We may share your data with:
            </p>
            <ul>
              <li>
                <strong>Pandits and Acharyas:</strong> to facilitate the pooja or ritual
                you have booked (name and basic details only)
              </li>
              <li>
                <strong>Delivery partners:</strong> to ship physical products, Prasad, or
                puja essentials to your address
              </li>
              <li>
                <strong>Payment processors:</strong> to securely process your transactions
              </li>
              <li>
                <strong>Technology service providers:</strong> for hosting, analytics,
                email, and customer support tools, under strict confidentiality
                obligations
              </li>
              <li>
                <strong>Legal authorities:</strong> when required by law, court order, or
                to protect the rights and safety of Divyaum and its users
              </li>
            </ul>

            <h2>6. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience on our
              website. These help us:
            </p>
            <ul>
              <li>Remember your preferences and login session</li>
              <li>Understand how you navigate our site</li>
              <li>Deliver relevant content and promotions</li>
            </ul>
            <p>
              You may disable cookies through your browser settings; however, some
              features of the website may not function correctly as a result.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as
              needed to provide services. We may retain certain data for longer periods to
              comply with legal obligations, resolve disputes, and enforce our agreements.
              You may request deletion of your account and personal data by contacting us
              at{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a>.
            </p>

            <h2>8. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect
              your personal information against unauthorised access, alteration,
              disclosure, or destruction. However, no method of transmission over the
              internet or electronic storage is 100% secure. While we strive to use
              commercially acceptable means to protect your information, we cannot
              guarantee absolute security.
            </p>

            <h2>9. Your Rights</h2>
            <p>
              Depending on your location and applicable law (including India&apos;s
              Digital Personal Data Protection Act, 2023), you may have the right to:
            </p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Object to or restrict certain types of processing</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a> or call{" "}
              <a href={TEL_HREF}>{PHONE_DISPLAY}</a>.
            </p>

            <h2>10. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do
              not knowingly collect personal data from minors. If you believe we have
              inadvertently collected such information, please contact us immediately
              and we will take steps to delete it.
            </p>

            <h2>11. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites, including social
              media platforms (Instagram, YouTube, LinkedIn) and YouTube video embeds. We
              are not responsible for the privacy practices of those sites and encourage
              you to review their respective privacy policies.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in
              our practices or applicable law. When we make material changes, we will
              update the effective date at the top of this document. We encourage you to
              review this policy periodically.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy
              Policy, please contact:
            </p>
            <ul>
              <li>
                <strong>Divyaum</strong>
              </li>
              <li>
                Email:{" "}
                <a href={MAILTO_HREF}>{EMAIL}</a>
              </li>
              <li>
                Phone:{" "}
                <a href={TEL_HREF}>{PHONE_DISPLAY}</a>
              </li>
              <li>
                WhatsApp:{" "}
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {WHATSAPP_HREF}
                </a>
              </li>
              <li>
                Website:{" "}
                <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">
                  {WEBSITE_DISPLAY}
                </a>
              </li>
            </ul>

            {/* <p className={styles.tagline}>Shraddha • Samarpan • Shakt</p> */}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
