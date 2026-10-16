"use client";

import { useEffect, useId, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { getStoredToken } from "@/components/StoreProductCard/cartApi";
import { saveUserPhone, splitPhoneInput } from "@/lib/userPhoneApi";
import styles from "./PhoneRequiredModal.module.scss";

export default function PhoneRequiredModal({ open, onClose, onSaved }) {
  const titleId = useId();
  const inputId = useId();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMobile("");
    setError("");
    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const { phoneNumber, countryCode } = splitPhoneInput(mobile);
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setError("Please sign in again.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await saveUserPhone({ token, phoneNumber, countryCode });
      onSaved?.({ phoneNumber, countryCode });
    } catch (err) {
      setError(err?.message || "Could not save phone number.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={() => {
        if (!saving) onClose?.();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className={styles.dialogTitle}>
          Phone number required
        </h2>
        <p className={styles.dialogHint}>
          Please share your phone number to continue. We&apos;ll use it for
          order and booking updates.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={inputId}>
              Phone number
            </label>
            <div className={styles.phoneWrap}>
              <PhoneInput
                country="in"
                preferredCountries={["in"]}
                enableSearch
                disableSearchIcon
                value={mobile}
                onChange={(phone) => {
                  setMobile(phone);
                  if (error) setError("");
                }}
                inputClass={styles.phoneInput}
                containerClass={styles.phoneInputContainer}
                buttonClass={styles.phoneInputButton}
                dropdownClass={styles.phoneDropdown}
                searchClass={styles.phoneSearch}
                inputProps={{
                  id: inputId,
                  name: "phone",
                  required: true,
                  autoFocus: true,
                  placeholder: "Enter mobile number",
                }}
                inputStyle={{
                  width: "100%",
                  height: "44px",
                  fontSize: "1rem",
                }}
                buttonStyle={{
                  border: "none",
                  background: "transparent",
                }}
                containerStyle={{
                  width: "100%",
                }}
                dropdownStyle={{
                  width: "340px",
                  maxHeight: "220px",
                }}
                disabled={saving}
              />
            </div>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => onClose?.()}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? "Saving…" : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
