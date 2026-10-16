"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { openRazorpayCheckout, pollPaymentStatus } from "@/lib/razorpay";
import styles from "./RazorpayCheckout.module.scss";

/**
 * Reusable Razorpay payment modal overlay.
 *
 * Renders three sequential phases:
 *   1. Opening checkout  – spinner while Razorpay SDK loads
 *   2. Verifying payment – spinner while polling backend status
 *   3. Result            – success or failure card with action buttons
 *
 * @param {object}   props
 * @param {boolean}  props.open          Whether the modal is visible
 * @param {object}   props.paymentData   Backend response: { key, order_id, amount, currency, booking_id }
 * @param {string}   [props.description] Short text shown in Razorpay dialog
 * @param {{ name?: string, email?: string, contact?: string }} [props.prefill]
 * @param {() => void}              props.onSuccess  Called after confirmed payment success
 * @param {(msg: string) => void}   props.onFailure  Called on payment failure/cancel
 * @param {() => void}              props.onClose    Called to close this overlay
 * @param {string}  [props.successHint]      Text shown below "Payment Successful!"
 * @param {string}  [props.successBtnLabel]  Label for the success action button
 * @param {string}  [props.referenceLabel]   Label for the reference ID row (e.g. "Booking ID" or "Order ID")
 */
export default function RazorpayCheckout({
  open,
  paymentData,
  description = "",
  prefill = {},
  onSuccess,
  onFailure,
  onClose,
  successHint = "Your booking has been confirmed.",
  successBtnLabel = "View My Bookings",
  referenceLabel = "Booking ID",
}) {
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const didStart = useRef(false);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  }, []);

  useEffect(() => {
    if (!open || !paymentData || didStart.current) return;
    didStart.current = true;

    let cancelled = false;

    const run = async () => {
      try {
        setPhase("checkout");
        setError("");

        await openRazorpayCheckout({
          key: paymentData.key,
          order_id: paymentData.order_id,
          amount: paymentData.amount,
          currency: paymentData.currency || "INR",
          description,
          prefill,
        });

        if (cancelled) return;

        setPhase("verifying");

        const token = getToken();
        if (!token) {
          throw new Error("Session expired. Please login again.");
        }

        const result = await pollPaymentStatus(paymentData.order_id, token);

        if (cancelled) return;

        if (result.status === "success") {
          setPhase("success");
        } else if (result.status === "failed") {
          setPhase("failed");
          setError("Payment could not be completed. Please try again.");
        } else {
          setPhase("success");
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err?.message || "Payment failed. Please try again.";

        if (msg.includes("cancelled by user")) {
          setPhase("cancelled");
          setError("Payment was cancelled.");
        } else {
          setPhase("failed");
          setError(msg);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [open, paymentData, description, prefill, getToken]);

  useEffect(() => {
    if (!open) {
      didStart.current = false;
      setPhase("idle");
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSuccessAction = () => {
    onSuccess?.();
    onClose?.();
  };

  const handleFailureAction = () => {
    onFailure?.(error);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Payment"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading / Checkout phase */}
        {(phase === "checkout" || phase === "idle") && (
          <div className={styles.center}>
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.statusText}>Opening Razorpay checkout…</p>
            <p className={styles.statusHint}>Please complete payment in the popup.</p>
          </div>
        )}

        {/* Verifying phase */}
        {phase === "verifying" && (
          <div className={styles.center}>
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.statusText}>Verifying payment…</p>
            <p className={styles.statusHint}>Please wait while we confirm your payment.</p>
          </div>
        )}

        {/* Success phase */}
        {phase === "success" && (
          <div className={styles.center}>
            <span className={styles.checkIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <p className={styles.successTitle}>Payment Successful!</p>
            <p className={styles.statusHint}>{successHint}</p>
            <div className={styles.summaryCard}>
              {paymentData?.booking_id && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>{referenceLabel}</span>
                  <span className={styles.summaryValue}>{paymentData.booking_id}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Amount Paid</span>
                <span className={styles.summaryValueBold}>
                  ₹ {Number(paymentData?.amount ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleSuccessAction}
            >
              {successBtnLabel}
            </button>
          </div>
        )}

        {/* Failed / Cancelled phase */}
        {(phase === "failed" || phase === "cancelled") && (
          <div className={styles.center}>
            <span className={styles.failIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </span>
            <p className={styles.failTitle}>
              {phase === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
            </p>
            <p className={styles.statusHint}>{error}</p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleFailureAction}
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
