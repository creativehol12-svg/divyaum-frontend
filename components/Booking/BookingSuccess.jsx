"use client";

import { useEffect } from "react";
import styles from "./BookingSuccess.module.scss";
import Button from "@/components/Button";

export default function BookingSuccess({ booking, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bookingDate = new Date(booking.bookedDate);
  const dateStr = bookingDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.popup}
        role="dialog"
        aria-modal="true"
        aria-label="Booking successful"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.icon} aria-hidden="true">
          ✓
        </div>

        <h2 className={styles.title}>Booking Confirmed!</h2>

        <div className={styles.details}>
          <p className={styles.detailRow}>
            <span className={styles.label}>Pooja:</span>
            <span className={styles.value}>{booking.poojaTitle}</span>
          </p>
          <p className={styles.detailRow}>
            <span className={styles.label}>Package:</span>
            <span className={styles.value}>{booking.packageTitle}</span>
          </p>
          <p className={styles.detailRow}>
            <span className={styles.label}>Date:</span>
            <span className={styles.value}>{dateStr}</span>
          </p>
          <p className={styles.detailRow}>
            <span className={styles.label}>Amount:</span>
            <span className={styles.value} style={{ fontWeight: 700 }}>
              ₹ {booking.packagePrice}
            </span>
          </p>
        </div>

        <p className={styles.message}>
          Your booking is confirmed! A confirmation email and call details will be sent shortly.
        </p>

        <Button variant="unstyled" type="button" className={styles.closeBtn} onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
