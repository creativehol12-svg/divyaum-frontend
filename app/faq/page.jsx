import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.scss";
import {
  PHONE_NUMBER,
  PHONE_DISPLAY,
  EMAIL,
  TEL_HREF,
  MAILTO_HREF,
  WHATSAPP_HREF,
  getWebsite,
} from "@/lib/contact";

export const metadata = {
  title: "FAQ | Divyaum",
  description:
    "Frequently asked questions about Divyaum online pooja, Vedic astrology, Divya Store, and more.",
};

export default async function FaqPage() {
  const { url: WEBSITE_URL } = await getWebsite();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.intro}>
            Everything you need to know about Divyaum&apos;s services: online pooja,
            Vedic astrology, Divya Store, and more.
          </p>

          <div className={styles.content}>
            <h2>Online Pooja</h2>

            <h3>How does an online pooja work?</h3>
            <p>
              After you book a pooja, our team confirms a date and time with you. On
              the day, a verified pandit performs the ritual at the chosen temple —
              depending on the package, either you participate live via video stream or
              a recorded video is shared with you. You will receive the prasad
              delivered to your home after the pooja is complete.
            </p>

            <h3>Are the pandits verified?</h3>
            <p>
              Yes. Divyaum works only with verified acharyas and pandits who are trained
              in Vedic traditions. Each pandit is assessed for ritual knowledge and
              authenticity before being onboarded.
            </p>

            <h3>Can I book a pooja from outside India?</h3>
            <p>
              Absolutely. Divyaum is designed for devotees everywhere in the world. You
              can join the pooja via live stream from any country, and we ship prasad
              internationally as well. Many of our regular devotees are based in the
              US, Canada, UK, and Russia.
            </p>

            <h3>What happens if I miss the live stream?</h3>
            <p>
              The pooja will be performed by the pandit as scheduled regardless. Your
              prasad will still be dispatched to your address. Please contact our team
              on WhatsApp (
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                {PHONE_NUMBER}
              </a>
              ) if you would like to discuss recording availability.
            </p>

            <h3>What is the cancellation and refund policy for poojas?</h3>
            <p>
              Cancellations 48+ hours before the pooja receive a 50% refund.
              Cancellations 24 hours before receive a 25% refund. Cancellations under 24
              hours are non-refundable. If Divyaum cancels for any reason, you receive a
              full refund.
            </p>

            <h3>How will I receive prasad?</h3>
            <p>
              Prasad is dispatched to your registered address after the pooja is
              completed. Delivery timelines depend on your location and courier
              availability. Prasad is non-returnable. Please ensure your address is
              correct at the time of booking.
            </p>

            <h2>Vedic Astrology</h2>

            <h3>What kind of guidance can I get from an astrology session?</h3>
            <p>
              Our Jyotish acharyas offer guidance on kundli analysis, marriage
              compatibility, career decisions, financial outlook, and practical remedies,
              including gemstone recommendations, pooja suggestions, and mantra chanting.
              Sessions are one-on-one for personalised attention.
            </p>

            <h3>How do I book an astrology consultation?</h3>
            <p>
              Visit the Vedic Astrology page, choose your preferred astrologer, and
              click Book Now. You will need to provide your date, time, and place of
              birth for an accurate reading. Our team will confirm the session slot with
              you.
            </p>

            <h3>Is astrology guidance a substitute for medical or legal advice?</h3>
            <p>
              No. Astrology consultations are for spiritual and informational purposes
              only and do not constitute medical, legal, financial, or psychological
              advice. We encourage you to consult qualified professionals for such
              matters alongside your spiritual guidance.
            </p>

            <h3>Can I get a refund if I am unhappy with my consultation?</h3>
            <p>
              Once a consultation has commenced, refunds are not provided. However, if
              the session could not begin due to a technical issue on our end, we will
              offer a full rescheduling or refund. Please email{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a> if you encounter
              any issues.
            </p>

            <h3>What information should I keep ready before my session?</h3>
            <p>
              Please have your exact date, time, and place of birth ready. If you have
              specific questions about marriage, career, health, or a particular life
              decision, note them in advance so the acharya can provide the most
              relevant guidance during the session.
            </p>

            <h2>Divya Store</h2>

            <h3>Are the products in the Divya Store authentic?</h3>
            <p>
              Yes. All products are verified and sourced with purity in mind. Our range
              includes organic and bamboo-free dhoops, havan cups, rudraksha, and other
              sacred essentials. We are committed to quality and transparency with every
              product we offer.
            </p>

            <h3>Do you deliver products outside India?</h3>
            <p>
              We deliver across India and internationally where available. Delivery
              timelines are estimates and may vary based on your location and courier
              availability. Divyaum is not responsible for delays caused by third-party
              courier services.
            </p>

            <h3>What is the return policy for store products?</h3>
            <p>
              Products can be returned within 7 days of delivery if received in damaged
              or incorrect condition. Contact{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a> with your order
              number and a photo of the issue. Perishable items and prasad are
              non-returnable. Refunds are processed within 7–10 business days after
              approval.
            </p>

            <h3>How are payments processed? Is it safe?</h3>
            <p>
              All payments are processed through a secure, PCI-DSS-compliant payment
              gateway (Razorpay). Divyaum does not store your card details — your
              financial information is encrypted and handled directly by our payment
              partner.
            </p>

            <h2>General</h2>

            <h3>What is Divyaum?</h3>
            <p>
              Divyaum is India&apos;s trusted online spiritual platform, founded to make
              Sanatan Dharma accessible to every home worldwide. We offer online pooja
              bookings, Vedic astrology consultations, and a curated store of authentic
              sacred essentials — all rooted in 5,000 years of Sanatan wisdom.
            </p>

            <h3>How do I contact the support team?</h3>
            <p>
              You can reach us via WhatsApp at{" "}
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                {PHONE_DISPLAY}
              </a>
              , by email at{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a>, or by phone at{" "}
              <a href={TEL_HREF}>{PHONE_DISPLAY}</a>. A floating WhatsApp
              button is also available on every page of the website for quick access.
            </p>

            <h3>Is my personal data safe with Divyaum?</h3>
            <p>
              Yes. We follow India&apos;s Digital Personal Data Protection Act, 2023, and
              implement appropriate technical measures to protect your information. We
              do not sell or rent your data to third parties. You can request the
              deletion of your data at any time by emailing{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a>.
            </p>

            <h3>Do I need to create an account to book?</h3>
            <p>
              An account lets you manage bookings, track orders, and save your details
              for future use. You can also contact our team directly via WhatsApp to get
              assistance with a booking without logging in — we are here to help you
              every step of the way.
            </p>

            <h3>What happens if a transaction fails but my account is debited?</h3>
            <p>
              In the event of a failed transaction in which your account has been
              debited, the amount is typically refunded by your bank or payment provider
              within 5–7 business days. Please write to{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a> with your
              transaction details if the issue persists.
            </p>

            <h2>Still have a question?</h2>
            <p>Contact our support team:</p>
            <ul>
              <li>
                <strong>WhatsApp / Phone:</strong>{" "}
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a href={MAILTO_HREF}>{EMAIL}</a>
              </li>
               <li>
                <strong>Website:</strong>{" "}
                <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">
                  {WEBSITE_URL}
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
