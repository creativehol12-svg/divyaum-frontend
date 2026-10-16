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
  title: "Terms and Conditions | Divyaum",
  description:
    "Read the Terms and Conditions for using Divyaum online pooja, astrology, and store services.",
};

export default async function TermsAndConditionsPage() {
  const { url: WEBSITE_URL, display: WEBSITE_DISPLAY } = await getWebsite();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>Terms and Conditions</h1>
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
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Divyaum website ({WEBSITE_DISPLAY}) and any of its
              services, you agree to be bound by these Terms and Conditions
              (&quot;Terms&quot;). If you do not agree with any part of these Terms, please
              do not use our platform.
            </p>
            <p>
              These Terms apply to all visitors, registered users, and anyone who accesses
              or uses our services, including Online Pooja bookings, Vedic Astrology
              consultations, and purchases from the Divya Store.
            </p>

            <h2>2. About Divyaum</h2>
            <p>
              Divyaum is an online spiritual platform based in India that connects users
              with verified pandits, Acharyas, and sacred products rooted in Sanatan Dharma.
              We offer:
            </p>
            <ul>
              <li>
                <strong>Online Pooja:</strong> Live and scheduled ritual bookings with
                experienced pandits at temples across India
              </li>
              <li>
                <strong>Vedic Astrology:</strong> One-on-one consultations with qualified
                astrologers
              </li>
              <li>
                <strong>Divya Store:</strong> Curated, authentic spiritual products
                including rudraksha, dhoops, havan cups, and puja essentials
              </li>
            </ul>

            <h2>3. User Accounts</h2>

            <h3>3.1 Registration</h3>
            <p>
              To access certain features, you must create an account. You agree to provide
              accurate, current, and complete information during registration and to keep
              your account details up to date.
            </p>

            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your login
              credentials and for all activities that occur under your account. Please
              notify us immediately at{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a> if you suspect any
              unauthorised use of your account.
            </p>

            <h3>3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at our discretion
              if we believe you have violated these Terms or engaged in fraudulent, abusive,
              or illegal activity.
            </p>

            <h2>4. Online Pooja Services</h2>

            <h3>4.1 Booking</h3>
            <p>
              When you book an Online Pooja, you are reserving a specific ritual at a
              specific date and time with an assigned pandit or Acharya. Bookings are
              subject to availability and confirmation by our team.
            </p>

            <h3>4.2 Participation</h3>
            <p>
              You may participate in your pooja via a live video stream. We recommend a
              stable internet connection for the best experience. Technical issues on the
              user&apos;s end do not qualify for a refund.
            </p>

            <h3>4.3 Spiritual Disclaimer</h3>
            <p>
              Divyaum facilitates authentic rituals performed by qualified pandits in
              accordance with Vedic traditions. However, we make no guarantees regarding
              specific spiritual outcomes, results, or benefits. Spiritual practices are
              matters of personal faith and experience.
            </p>

            <h2>5. Vedic Astrology Services</h2>
            <p>
              Astrology consultations on Divyaum are provided for informational and
              spiritual guidance purposes only. They do not constitute legal, medical,
              financial, or psychological advice. Users are encouraged to exercise personal
              judgement and consult qualified professionals for such matters. Divyaum and
              its astrologers shall not be held liable for decisions made based on
              astrological guidance.
            </p>

            <h2>6. Divya Store – Products</h2>

            <h3>6.1 Product Authenticity</h3>
            <p>
              We are committed to offering verified and authentic spiritual products.
              Product descriptions are provided in good faith based on supplier information.
            </p>

            <h3>6.2 Delivery</h3>
            <p>
              We deliver products across India and internationally (where available).
              Delivery timelines are estimates and may vary due to logistics, location, or
              other factors. Divyaum is not responsible for delays caused by third-party
              courier services.
            </p>

            <h3>6.3 Prasad Delivery</h3>
            <p>
              Prasad from completed poojas is dispatched to your registered address.
              Delivery of Prasad is subject to the completion of the ritual and courier
              availability.
            </p>

            <h2>7. Payments</h2>

            <h3>7.1 Payment Gateway</h3>
            <p>
              All payments are processed through a secure third-party payment gateway (such
              as Razorpay). By making a payment, you agree to the applicable terms of that
              gateway provider. Divyaum does not store your payment card details.
            </p>

            <h3>7.2 Pricing</h3>
            <p>
              All prices listed on the website are in Indian Rupees (INR) unless otherwise
              specified and include applicable taxes. We reserve the right to change prices
              at any time without prior notice, except for confirmed bookings and orders.
            </p>

            <h3>7.3 Failed Transactions</h3>
            <p>
              In the event of a failed transaction where your account has been debited, the
              amount will typically be refunded by your bank or payment provider within 5–7
              business days. Please contact us at{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a> if you face any
              payment issues.
            </p>

            <h2>8. Cancellations and Refunds</h2>

            <h3>8.1 Online Pooja</h3>
            <ul>
              <li>
                Cancellations made 48 hours or more before the scheduled pooja: Full refund
              </li>
              <li>Cancellations made 24 hours before: 50% refund</li>
              <li>Cancellations made less than 24 hours before: No refund</li>
              <li>
                If Divyaum cancels a pooja due to pandit unavailability or other operational
                reasons, a full refund will be issued
              </li>
            </ul>

            <h3>8.2 Products (Divya Store)</h3>
            <ul>
              <li>
                Products may be returned within 7 days of delivery if received in damaged or
                incorrect condition
              </li>
              <li>
                To initiate a return, contact{" "}
                <a href={MAILTO_HREF}>{EMAIL}</a> with your order
                number and a photo of the issue
              </li>
              <li>Perishable items and Prasad are non-returnable</li>
              <li>Refunds are processed within 7–10 business days after return approval</li>
            </ul>

            <h3>8.3 Astrology Consultations</h3>
            <p>
              Once an astrology consultation has commenced, no refund will be provided. If a
              session is unable to start due to a technical issue on Divyaum&apos;s end, a
              rescheduling or full refund will be offered.
            </p>

            <h2>9. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the platform for any unlawful, fraudulent, or harmful purpose</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Submit false bookings or engage in payment fraud</li>
              <li>Disrupt, damage, or interfere with the operation of the website</li>
              <li>
                Reproduce, resell, or exploit any content or services without written
                authorisation from Divyaum
              </li>
              <li>Use automated bots or scripts to access the platform</li>
            </ul>

            <h2>10. Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, videos, icons, and
              service names, is the intellectual property of Divyaum or its licensors and is
              protected under applicable intellectual property laws. You may not copy,
              reproduce, distribute, or create derivative works without our prior written
              consent.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Divyaum and its founders,
              directors, employees, and partners shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the
              platform, including but not limited to loss of revenue, data, goodwill, or
              spiritual outcomes.
            </p>
            <p>
              Our total aggregate liability for any claim arising from these Terms or your
              use of our services shall not exceed the amount you paid us in the three
              months preceding the claim.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Divyaum and its team from any claims,
              losses, damages, liabilities, and expenses (including legal fees) arising out
              of your use of our platform, your breach of these Terms, or your violation of
              any third-party rights.
            </p>

            <h2>13. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of
              India. Any dispute arising in connection with these Terms shall first be
              attempted to be resolved through good-faith negotiation. If unresolved,
              disputes shall be subject to the exclusive jurisdiction of the courts in
              Delhi, India.
            </p>

            <h2>14. Changes to These Terms</h2>
            <p>
              We may revise these Terms at any time. When we do, we will update the
              effective date at the top. Continued use of our platform after such changes
              constitutes your acceptance of the revised Terms. We encourage you to review
              this page periodically.
            </p>

            <h2>15. Contact Us</h2>
            <p>
              For any questions or concerns about these Terms and Conditions, please reach
              out to us:
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
