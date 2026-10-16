"use client";

import { useCallback, useEffect, useId, useState } from "react";

import addressFormOptions from "@/data/address-form-options.json";
import styles from "./AddressAddModal.module.scss";

function getCountryLabel(code) {
  return addressFormOptions.countries.find((c) => c.value === code)?.label ?? code;
}

function getStateLabel(code) {
  return addressFormOptions.indianStates.find((s) => s.value === code)?.label ?? code;
}

const emptyForm = () => ({
  address: "",
  pincode: "",
  country: "IN",
  stateCode: "",
  stateOther: "",
});

/** Card row shape (labels for country/state as stored server-side). */
function rowToForm(row) {
  const countryCode =
    addressFormOptions.countries.find((c) => c.label === row.country)?.value ?? "IN";
  let stateCode = "";
  let stateOther = "";
  if (countryCode === "IN") {
    stateCode =
      addressFormOptions.indianStates.find((s) => s.label === row.state)?.value ?? "";
  } else {
    stateOther = row.state ?? "";
  }
  return {
    address: row.address ?? "",
    pincode: row.pincode ?? "",
    country: countryCode,
    stateCode,
    stateOther,
  };
}

/**
 * City = text after the last comma in the address field. Everything before that comma is street;
 * split into Line1 / Line2 by newlines (first line → Line1, remaining lines joined with ", " → Line2).
 * If there is no comma, the whole field is Line1 and city falls back to the selected state (legacy).
 * @returns {{ Line1: string, Line2: string, city: string, error?: string }}
 */
function buildApiAddressParts(addressText, stateDisplay) {
  const raw = addressText.trim();
  if (!raw) {
    return { Line1: "", Line2: "", city: stateDisplay };
  }

  const lastComma = raw.lastIndexOf(",");
  if (lastComma === -1) {
    return { Line1: raw, Line2: "", city: stateDisplay };
  }

  const cityPart = raw.slice(lastComma + 1).trim();
  const streetPart = raw.slice(0, lastComma).trim();

  if (!cityPart) {
    return {
      Line1: streetPart,
      Line2: "",
      city: "",
      error: "Enter the city after the last comma (for example: “Street, area, Mumbai”).",
    };
  }

  const lines = streetPart
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { Line1: "", Line2: "", city: cityPart };
  }
  if (lines.length === 1) {
    return { Line1: lines[0], Line2: "", city: cityPart };
  }
  return {
    Line1: lines[0],
    Line2: lines.slice(1).join(", "),
    city: cityPart,
  };
}

/**
 * Add / edit address via parent-provided API callbacks only (no localStorage).
 * @param {(fields: object) => Promise<object>} createAddress — required for new addresses
 * @param {(args: { id: string } & object) => Promise<object>} [updateAddress] — when editing
 */
export default function AddressAddModal({
  open,
  onClose,
  onSaved,
  editRecord = null,
  hint = "Fill the form and save.",
  createAddress,
  updateAddress,
}) {
  const titleId = useId();
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isIndia = form.country === "IN";

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setForm(editRecord?.id ? rowToForm(editRecord) : emptyForm());
      setFormError("");
      setIsSubmitting(false);
    });
  }, [open, editRecord?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        setFormError("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = async () => {
    const address = form.address.trim();
    const pincode = form.pincode.trim();
    const stateDisplay = isIndia ? getStateLabel(form.stateCode) : form.stateOther.trim();
    const editingId = editRecord?.id ?? null;
    const countryLabel = getCountryLabel(form.country);

    if (!address) {
      setFormError("Please enter your address.");
      return;
    }
    if (!pincode) {
      setFormError("Please enter pincode.");
      return;
    }
    if (isIndia && !/^\d{6}$/.test(pincode)) {
      setFormError("Pincode should be 6 digits for India.");
      return;
    }
    if (!isIndia && pincode.length < 3) {
      setFormError("Please enter a valid pincode / postal code.");
      return;
    }
    if (isIndia && !form.stateCode) {
      setFormError("Please select a state.");
      return;
    }
    if (!isIndia && !form.stateOther.trim()) {
      setFormError("Please enter state / province.");
      return;
    }

    const built = buildApiAddressParts(address, stateDisplay);
    if (built.error) {
      setFormError(built.error);
      return;
    }
    const { Line1, Line2, city } = built;
    const apiFields = {
      Line1,
      Line2,
      city,
      state: stateDisplay,
      country: countryLabel,
      Pincode: pincode,
    };

    if (editingId) {
      if (typeof updateAddress !== "function") {
        setFormError("Updating an address is not configured yet.");
        return;
      }
      setIsSubmitting(true);
      setFormError("");
      try {
        const row = await updateAddress({ id: editingId, ...apiFields });
        setFormError("");
        onClose();
        onSaved?.(row);
      } catch (err) {
        setFormError(err?.message || "Could not update address.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (typeof createAddress !== "function") {
      setFormError("Address save is not configured.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      const row = await createAddress(apiFields);
      setFormError("");
      onClose();
      onSaved?.(row);
    } catch (err) {
      setFormError(err?.message || "Could not save address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = Boolean(editRecord?.id);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          setFormError("");
        }
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
          {isEdit ? "Edit address" : "Add address"}
        </h2>
        <p className={styles.dialogHint}>{hint}</p>

        <div className={styles.form}>
          <label className={styles.label}>
            Address
            <textarea
              className={styles.textarea}
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              rows={4}
              autoComplete="street-address"
            />
          </label>
          <label className={styles.label}>
            Country
            <select
              className={styles.select}
              value={form.country}
              onChange={(e) => setField("country", e.target.value)}
            >
              {addressFormOptions.countries.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

           {isIndia ? (
            <label className={styles.label}>
              State
              <select
                className={styles.select}
                value={form.stateCode}
                onChange={(e) => setField("stateCode", e.target.value)}
              >
                <option value="">Select state</option>
                {addressFormOptions.indianStates.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className={styles.label}>
              State / province
              <input
                className={styles.input}
                value={form.stateOther}
                onChange={(e) => setField("stateOther", e.target.value)}
                autoComplete="address-level1"
              />
            </label>
          )}

          <label className={styles.label}>
            Pincode
            <input
              className={styles.input}
              value={form.pincode}
              onChange={(e) => setField("pincode", e.target.value)}
              inputMode="numeric"
              autoComplete="postal-code"
            />
          </label>
          {formError ? <p className={styles.error}>{formError}</p> : null}

          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.btnGhost}
              disabled={isSubmitting}
              onClick={() => {
                onClose();
                setFormError("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add address"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
