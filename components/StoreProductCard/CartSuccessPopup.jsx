import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./CartSuccessPopup.module.scss";

export default function CartSuccessPopup({ onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={styles.anchor} aria-live="polite">
      <div
        className={styles.popup}
        role="status"
        aria-label="Added to cart"
      >
        <button
          type="button"
          className={styles.dismiss}
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
        <div className={styles.iconWrap} aria-hidden="true">
          <span className={styles.icon}>✓</span>
        </div>
        <p className={styles.kicker}>Divya Store</p>
        <p className={styles.message}>Added to your sacred basket</p>
      </div>
    </div>,
    document.body,
  );
}
