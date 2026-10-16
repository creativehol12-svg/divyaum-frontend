import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.scss";
import {
  PHONE_NUMBER,
  PHONE_DISPLAY,
  EMAIL,
  MAILTO_HREF,
  WHATSAPP_HREF,
  getWebsite,
} from "@/lib/contact";

export const metadata = {
  title: "Shipping & Return Policy | Divyaum",
  description:
    "Shipping, delivery, return, and refund policies for Divyaum store products, prasad, and bookings.",
};

export default async function ShippingReturnPolicyPage() {
  const { url: WEBSITE_URL, display: WEBSITE_DISPLAY } = await getWebsite();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>Shipping &amp; Return Policy</h1>
          <p className={styles.updatedAt}>Effective Date: July 01, 2026</p>
          <p className={styles.meta}>
            Website:{" "}
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {WEBSITE_DISPLAY}
            </a>{" "}
            | Contact:{" "}
            <a href={MAILTO_HREF}>{EMAIL}</a>
          </p>

          <div className={styles.content}>
            <h2>1. Overview</h2>
            <p>
              At Divyaum, every product we ship is a sacred offering — selected with care,
              packed with intention, and delivered with devotion. This policy covers all
              physical deliveries, including store products, prasad from completed poojas,
              and havan samagri.
            </p>
            <p>
              Please read this policy carefully before placing an order. By purchasing from
              the Divya Store or booking a pooja with prasad delivery, you agree to the
              terms outlined below.
            </p>

            <h2>2. Shipping — Divya Store Products</h2>

            <h3>2.1 Delivery areas</h3>
            <ul>
              <li>We deliver across all states and union territories in India.</li>
              <li>
                International shipping is available to select countries including the US,
                Canada, UK, UAE, Singapore, Australia, and Russia.
              </li>
              <li>
                If your country is not listed at checkout, please write to{" "}
                <a href={MAILTO_HREF}>{EMAIL}</a>, and we will do
                our best to assist you.
              </li>
            </ul>

            <h3>2.2 Estimated delivery timelines</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Estimated delivery time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Metro cities (Delhi, Mumbai, Bengaluru, etc.)</td>
                    <td>5–7 business days</td>
                  </tr>
                  <tr>
                    <td>Other cities and towns in India</td>
                    <td>7–10 business days</td>
                  </tr>
                  <tr>
                    <td>Remote / rural areas in India</td>
                    <td>7–14 business days</td>
                  </tr>
                  <tr>
                    <td>International — South Asia &amp; Southeast Asia</td>
                    <td>10–15 business days</td>
                  </tr>
                  <tr>
                    <td>International — US, UK, Canada, Europe</td>
                    <td>12–20 business days</td>
                  </tr>
                  <tr>
                    <td>International — Other regions</td>
                    <td>15–25 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              All timelines are estimates from the dispatch date. Divyaum is not responsible
              for delays caused by courier partners, weather, customs, or other factors
              outside our control.
            </p>

            <h3>2.3 Shipping charges</h3>
            <ul>
              <li>Free shipping on all orders above ₹500 within India.</li>
              <li>
                A flat shipping fee applies to orders below ₹500 — this will be shown at
                checkout.
              </li>
              <li>
                International shipping charges are calculated at checkout based on
                destination and order weight.
              </li>
              <li>
                Customs duties, import taxes, and local levies for international orders are
                the responsibility of the recipient.
              </li>
            </ul>

            <h3>2.4 Order processing</h3>
            <ul>
              <li>
                Orders are typically processed within 1–2 business days of payment
                confirmation.
              </li>
              <li>
                You will receive a shipping confirmation with a tracking link via email or
                WhatsApp once your order is dispatched.
              </li>
              <li>
                Orders placed on Sundays or public holidays will be processed on the next
                working day.
              </li>
            </ul>

            <h2>3. Prasad Delivery</h2>
            <p>
              Prasad from completed poojas is a sacred offering and is handled with the
              utmost care.
            </p>
            <ul>
              <li>
                Prasad is dispatched within 2–4 business days after the pooja is completed.
              </li>
              <li>
                Delivery timelines follow the same schedule as Divya Store products (see
                Section 2.2).
              </li>
              <li>
                Please ensure your delivery address is correct at the time of booking — we
                are unable to reroute prasad shipments once dispatched.
              </li>
              <li>
                Prasad is non-returnable and non-refundable under any circumstances.
              </li>
            </ul>
            <p>
              If your prasad has not arrived within the expected timeline, please contact us
              at{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a> or WhatsApp{" "}
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                {PHONE_NUMBER}
              </a>
              .
            </p>

            <h2>4. Return Policy — Divya Store Products</h2>

            <h3>4.1 Eligible returns</h3>
            <p>We accept returns only in the following cases:</p>
            <ul>
              <li>The product arrived damaged or broken.</li>
              <li>The wrong product was delivered (different from what was ordered).</li>
              <li>
                The product is significantly different from its description on the website.
              </li>
            </ul>
            <p>Returns must be initiated within 7 days of the delivery date.</p>

            <h3>4.2 Non-returnable items</h3>
            <p>The following items are strictly non-returnable:</p>
            <ul>
              <li>Prasad from poojas (sacred offering — cannot be returned).</li>
              <li>
                Perishable items such as fresh flowers, natural incense, or food-based
                samagri.
              </li>
              <li>
                Items that have been used, opened, or are no longer in their original
                packaging.
              </li>
              <li>Customised or personalised products made to order.</li>
              <li>Digital products, pooja bookings, and astrology consultations.</li>
            </ul>

            <h3>4.3 How to raise a return request</h3>
            <p>To initiate a return, follow these steps:</p>
            <ol>
              <li>
                Email{" "}
                <a href={MAILTO_HREF}>{EMAIL}</a> with the subject
                line: <strong>Return Request — [Your Order Number]</strong>.
              </li>
              <li>
                Attach a clear photograph of the damaged or incorrect product.
              </li>
              <li>
                Our team will review your request within 2 business days and respond with
                next steps.
              </li>
              <li>
                If the return is approved, we will arrange a pickup or advise on how to send
                the item back.
              </li>
            </ol>

            <h2>5. Refund Policy</h2>

            <h3>5.1 Store products</h3>
            <ul>
              <li>
                Refunds for approved returns are processed within 7–10 business days after we
                receive and inspect the item.
              </li>
              <li>
                Refunds are credited to your original payment method (bank account, UPI, or
                card).
              </li>
              <li>
                Shipping charges are non-refundable unless the return was due to our error.
              </li>
            </ul>

            <h3>5.2 Pooja bookings</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Cancellation timing</th>
                    <th>Refund amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>48 hours or more before scheduled pooja</td>
                    <td>Full refund</td>
                  </tr>
                  <tr>
                    <td>24–48 hours before scheduled pooja</td>
                    <td>50% refund</td>
                  </tr>
                  <tr>
                    <td>Less than 24 hours before scheduled pooja</td>
                    <td>25% refund</td>
                  </tr>
                  <tr>
                    <td>Cancelled by Divyaum (any reason)</td>
                    <td>100% full refund</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>5.3 Astrology consultations</h3>
            <ul>
              <li>Once a consultation has commenced, no refund will be provided.</li>
              <li>
                If the session cannot begin due to a technical issue on Divyaum&apos;s end,
                we will offer a full rescheduling or a 100% refund.
              </li>
            </ul>

            <h3>5.4 Failed transactions</h3>
            <p>
              If a payment fails but your bank account has been debited, the amount is
              typically reversed by your bank or payment provider within 5–7 business days.
              Please contact us at{" "}
              <a href={MAILTO_HREF}>{EMAIL}</a> with your transaction
              details if the refund has not appeared after 7 days.
            </p>

            <h2>6. Order Tracking</h2>
            <ul>
              <li>
                A tracking link will be sent to your registered email and WhatsApp number
                once your order is dispatched.
              </li>
              <li>
                You can also reach our support team at any time to check your order status.
              </li>
              <li>
                For orders delayed beyond the estimated delivery window, please contact us
                and we will follow up with our courier partner on your behalf.
              </li>
            </ul>

            <h2>7. Damaged or Lost Shipments</h2>
            <ul>
              <li>
                If your package arrives visibly damaged, please photograph the outer
                packaging and contents before opening fully, and contact us within 48 hours of
                delivery.
              </li>
              <li>
                In the rare event that a shipment is lost in transit, Divyaum will
                coordinate with the courier partner to resolve the issue or arrange a
                replacement.
              </li>
              <li>
                Divyaum&apos;s liability for lost shipments is limited to the value of the
                order placed.
              </li>
            </ul>

            <h2>8. Contact Us</h2>
            <p>
              For any questions about your order, shipping, or a return request, please reach
              out to us:
            </p>
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
                <a
                  href={WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {WEBSITE_DISPLAY}
                </a>
              </li>
            </ul>

            {/* <p className={styles.tagline}>
              © 2026 Divyaum. All rights reserved. | Shraddha · Samarpan · Shakti
            </p> */}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
