"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import styles from "./OrderSuccessModal.module.scss";

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {{ orderId?: string, total?: number }} props.data
 */
export default function OrderSuccessModal({ open, onClose, data }) {
  const router = useRouter();
  const orderId = data?.orderId || "";
  const total = Number(data?.total ?? 0) || 0;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Order placed">
        <div className={styles.confetti} aria-hidden="true">
          {Array.from({ length: 26 }).map((_, idx) => (
            <span
              key={idx}
              className={`${styles.confettiPiece} ${idx % 2 === 0 ? styles.confettiAlt : ""}`}
              style={{ ["--i"]: idx }}
            />
          ))}
        </div>

        <div className={styles.center}>
          <span className={styles.check} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>

          <p className={styles.successText}>Successfully ordered</p>

          <div className={styles.summary}>
            {orderId ? (
              <div className={styles.row}>
                <span className={styles.label}>Order ID</span>
                <span className={styles.value}>{orderId}</span>
              </div>
            ) : null}
            <div className={styles.row}>
              <span className={styles.label}>Total</span>
              <span className={styles.valueEmph}>₹ {formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => {
              onClose();
              router.push("/");
            }}
            >
            Go To Home
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => {
              onClose();
              router.push("/my-orders");
            }}
          >
            My orders
          </button>
        </div>
      </div>
    </div>
  );
}

