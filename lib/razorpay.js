const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

let scriptLoadPromise = null;

/**
 * Lazily loads the Razorpay checkout script once and caches the promise.
 * @returns {Promise<void>}
 */
export function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only be loaded in the browser"));
  }

  if (window.Razorpay) return Promise.resolve();

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error("Failed to load Razorpay SDK. Please check your connection."));
    };
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Opens the Razorpay checkout dialog.
 *
 * @param {object} options
 * @param {string} options.key           Razorpay key_id (from backend response)
 * @param {string} options.order_id      Razorpay order id (from backend response)
 * @param {number} options.amount        Amount in rupees (display only; Razorpay uses the order amount)
 * @param {string} [options.currency]    Currency code (default "INR")
 * @param {string} [options.name]        Business/app name shown in checkout
 * @param {string} [options.description] Short description shown in checkout
 * @param {string} [options.image]       Logo URL shown in checkout
 * @param {{ name?: string, email?: string, contact?: string }} [options.prefill]
 * @param {string} [options.theme_color] Hex color for the checkout button
 *
 * @returns {Promise<{ razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string }>}
 *          Resolves on successful payment, rejects on dismissal or failure.
 */
export async function openRazorpayCheckout({
  key,
  order_id,
  amount,
  currency = "INR",
  name = "Divyaum",
  description = "",
  image = "/icon/divyaum logo.png",
  prefill = {},
  theme_color = "#E5872A",
}) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key,
      amount: amount * 100,
      currency,
      name,
      description,
      image,
      order_id,
      prefill,
      theme: { color: theme_color },
      handler(response) {
        resolve(response);
      },
      modal: {
        ondismiss() {
          reject(new Error("Payment cancelled by user."));
        },
        escape: true,
        confirm_close: true,
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (response) => {
      const msg =
        response?.error?.description ||
        response?.error?.reason ||
        "Payment failed. Please try again.";
      reject(new Error(msg));
    });

    rzp.open();
  });
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30;

/**
 * Polls the backend payment status endpoint until the payment settles
 * (success / failed) or until max attempts are exhausted.
 *
 * @param {string} orderId  Razorpay order id
 * @param {string} token    Auth token
 * @returns {Promise<{ status: string, transaction_id?: string }>}
 */
export async function pollPaymentStatus(orderId, token) {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const res = await fetch(`${BASE_URL}/api/payment/status/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Payment status check failed (${res.status})`);
    }

    const data = await res.json();

    if (data.status === "success" || data.status === "failed") {
      return data;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  return { status: "pending" };
}
