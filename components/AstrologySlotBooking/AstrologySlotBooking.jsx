"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AstrologySlotBooking.module.scss";
import Button from "@/components/Button";
import AuthModal from "@/components/AuthModal/AuthModal";
import RazorpayCheckout from "@/components/RazorpayCheckout/RazorpayCheckout";
import PhoneRequiredModal from "@/components/PhoneRequiredModal/PhoneRequiredModal";
import { userHasPhoneOnFile } from "@/lib/userPhoneApi";

const SLOT_START_HOUR = 10;
const SLOT_END_HOUR = 19;
const DURATIONS = [15, 30, 45];
const DURATION_FROM_PLANS = "divyaum:consultation-duration";
const DURATION_SYNC_TO_PLANS = "divyaum:consultation-duration-changed";

function pickInitialDuration(fees) {
  if (!Array.isArray(fees) || !fees.length) return 30;
  const present = new Set(
    fees
      .map((f) => Number(f?.minutes ?? f?.duration))
      .filter((m) => DURATIONS.includes(m)),
  );
  if (present.has(30)) return 30;
  for (const d of DURATIONS) {
    if (present.has(d)) return d;
  }
  return 15;
}

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    }
  } catch { /* ignore */ }
  const userId = window.localStorage.getItem("userId");
  if (!userId) return null;
  return { _id: userId };
}

/** Same check as pooja booking: `user` object + `token` in localStorage. */
function isLoggedInForBooking() {
  if (typeof window === "undefined") return false;
  let user = null;
  try {
    user = JSON.parse(window.localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }
  const token = window.localStorage.getItem("token");
  return Boolean(user && token);
}

function getTodayInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function formatTime(dateObj) {
  return dateObj.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return amount.toLocaleString("en-IN");
}

// Convert "HH:MM" to total minutes from midnight
function toMins(timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  return hh * 60 + mm;
}

// ✅ Check if a slot overlaps with ANY booked range
// Overlap condition: slotStart < bookedEnd AND slotEnd > bookedStart
function isSlotOverlapping(slotStartTime, slotDurationMins, bookedRanges) {
  const slotStart = toMins(slotStartTime);
  const slotEnd = slotStart + slotDurationMins;

  return bookedRanges.some(({ startTime, duration }) => {
    const bookedStart = toMins(startTime);
    const bookedEnd = bookedStart + duration;
    return slotStart < bookedEnd && slotEnd > bookedStart;
  });
}

function buildSlots(dateValue, durationMins) {
  const start = new Date(`${dateValue}T00:00:00`);
  const dayStart = new Date(start);
  dayStart.setHours(SLOT_START_HOUR, 0, 0, 0);
  const dayEnd = new Date(start);
  dayEnd.setHours(SLOT_END_HOUR, 0, 0, 0);

  const slots = [];
  let pointer = new Date(dayStart);

  while (pointer.getTime() + durationMins * 60000 <= dayEnd.getTime()) {
    const end = new Date(pointer.getTime() + durationMins * 60000);
    const hh = String(pointer.getHours()).padStart(2, "0");
    const mm = String(pointer.getMinutes()).padStart(2, "0");

    slots.push({
      id: `${pointer.toISOString()}-${durationMins}`,
      startTime: `${hh}:${mm}`,
      label: `${formatTime(pointer)} – ${formatTime(end)}`,
    });

    pointer = new Date(pointer.getTime() + durationMins * 60000);
  }

  return slots;
}

function isPastSlot(dateStr, startTime) {
  const slotStart = new Date(`${dateStr}T${startTime}:00`);
  if (Number.isNaN(slotStart.getTime())) return false;
  return slotStart.getTime() < Date.now();
}

function normalizeDuration(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function resolveFeeForDuration(fees, duration) {
  if (!Array.isArray(fees) || !fees.length) return 0;

  const selectedDuration = normalizeDuration(duration);
  const matchingFee =
    fees.find((item) => normalizeDuration(item?.minutes) === selectedDuration) ||
    fees.find((item) => normalizeDuration(item?.duration) === selectedDuration) ||
    fees[0];

  const rawFee = matchingFee?.fee ?? matchingFee?.price ?? matchingFee?.amount ?? 0;
  const parsedFee = Number(String(rawFee).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsedFee) ? parsedFee : 0;
}

export default function AstrologySlotBooking({ serviceTitle, astrologerId, price, duration, fees = [] }) {
  const router = useRouter();
  const today = getTodayInputValue();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedDuration, setSelectedDuration] = useState(() => pickInitialDuration(fees));
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  const [hasMounted, setHasMounted] = useState(false);
  const [bookedRanges, setBookedRanges] = useState([]);

  const slots = useMemo(
    () => buildSlots(selectedDate, selectedDuration),
    [selectedDate, selectedDuration],
  );

  // Filter booked ranges for current date only
  const todayBookedRanges = useMemo(
    () => bookedRanges.filter((r) => r.date === selectedDate),
    [bookedRanges, selectedDate],
  );

  useEffect(() => { setHasMounted(true); }, []);

  // Fetch booked slots from API whenever date or astrologer changes (public endpoint)
  useEffect(() => {
    if (!hasMounted || !selectedDate) return;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";

    const params = new URLSearchParams({ date: selectedDate });
    // if (astrologerId) params.set("astrologerId", astrologerId);

    fetch(`${baseUrl}/api/astrologer/booked-slots?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.bookings)) {
          const mapped = data.bookings.map((b) => ({
            date: selectedDate,
            startTime: b.startTime,
            duration: Number(b.duration) || 0,
          }));
          setBookedRanges(mapped);
        }
      })
      .catch(() => {});
  }, [hasMounted, selectedDate, astrologerId]);

  // Skip isPastSlot during SSR to avoid hydration mismatch from Date.now() drift
  const availableSlotsCount = useMemo(
    () => slots.filter((slot) =>
      !isSlotOverlapping(slot.startTime, selectedDuration, todayBookedRanges) &&
      (!hasMounted || !isPastSlot(selectedDate, slot.startTime))
    ).length,
    [slots, selectedDate, selectedDuration, todayBookedRanges, hasMounted],
  );

  const bookedSlotsCount = useMemo(
    () => slots.filter((slot) =>
      isSlotOverlapping(slot.startTime, selectedDuration, todayBookedRanges)
    ).length,
    [slots, selectedDuration, todayBookedRanges],
  );


  useEffect(() => {
    setSelectedDuration(pickInitialDuration(fees));
    setSelectedSlotId("");
  }, [astrologerId]);

  useEffect(() => {
    const handler = (e) => {
      const minutes = Number(e?.detail);
      if (!DURATIONS.includes(minutes)) return;
      setSelectedDuration(minutes);
      setSelectedSlotId("");
      setConfirmation("");
    };
    window.addEventListener(DURATION_FROM_PLANS, handler);
    return () => window.removeEventListener(DURATION_FROM_PLANS, handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (!isBookingInProgress) setShowConfirmModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isBookingInProgress]);

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
  const selectedConsultationFee = resolveFeeForDuration(fees, selectedDuration) || Number(String(price).replace(/[^\d.]/g, "")) || 0;

  const onShowConfirmation = () => {
    if (!selectedSlot) {
      setConfirmation("Please select one slot before booking.");
      return;
    }
    if (
      isSlotOverlapping(selectedSlot.startTime, selectedDuration, todayBookedRanges) ||
      isPastSlot(selectedDate, selectedSlot.startTime)
    ) {
      setConfirmation("This slot is no longer available. Please pick another slot.");
      setSelectedSlotId("");
      return;
    }
    if (!astrologerId) {
      setConfirmation("Astrologer ID not found. Please try again.");
      return;
    }
    if (!isLoggedInForBooking()) {
      setAuthView("login");
      setAuthOpen(true);
      setConfirmation("");
      return;
    }
    setConfirmation("");
    setShowConfirmModal(true);
  };

  const onBook = async () => {
    if (isBookingInProgress) return;
    setIsBookingInProgress(true);

    const user = getStoredUser();
    if (!isLoggedInForBooking()) {
      setShowConfirmModal(false);
      setIsBookingInProgress(false);
      setAuthView("login");
      setAuthOpen(true);
      return;
    }
    const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

    try {
      const hasPhone = await userHasPhoneOnFile(token);
      if (!hasPhone) {
        setIsBookingInProgress(false);
        setPhoneModalOpen(true);
        return;
      }
    } catch {
      setIsBookingInProgress(false);
      setPhoneModalOpen(true);
      return;
    }

    await submitAstrologerBooking(user, token);
  };

  const submitAstrologerBooking = async (user, token) => {
    if (!selectedSlot) {
      setConfirmation("Please select one slot before booking.");
      setIsBookingInProgress(false);
      return;
    }

    const resolvedUser = user || getStoredUser();
    const resolvedToken =
      token ||
      (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);

    const payload = {
      userId: resolvedUser?._id || resolvedUser?.id || window.localStorage.getItem("userId") || "",
      astrologerId,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      duration: selectedDuration,
      fee: selectedConsultationFee,
      price: selectedConsultationFee,
      consultationFee: selectedConsultationFee,
    };

    setIsBookingInProgress(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:4000";
      const response = await fetch(`${baseUrl}/api/book-astrologer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resolvedToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        setConfirmation(json?.message || "Booking failed. Please try again.");
        setShowConfirmModal(false);
        setIsBookingInProgress(false);
        return;
      }

      setShowConfirmModal(false);
      setIsBookingInProgress(false);

      setPaymentData({
        key: json.key,
        order_id: json.order_id,
        amount: json.amount,
        currency: json.currency || "INR",
        booking_id: json.booking_id,
      });
      setPaymentOpen(true);

    } catch (err) {
      console.error("Booking error:", err);
      setConfirmation("Something went wrong. Please try again.");
      setIsBookingInProgress(false);
      setShowConfirmModal(false);
    }
  };

  const refetchBookedSlots = () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";
    const params = new URLSearchParams({ date: selectedDate });
    if (astrologerId) params.set("astrologerId", astrologerId);

    fetch(`${baseUrl}/api/astrologer/booked-slots?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.bookings)) {
          const mapped = data.bookings.map((b) => ({
            date: selectedDate,
            startTime: b.startTime,
            duration: Number(b.duration) || 0,
          }));
          setBookedRanges(mapped);
        }
      })
      .catch(() => {});
  };

  const handlePaymentSuccess = () => {
    refetchBookedSlots();

    if (typeof window !== "undefined") {
      const localBooking = {
        _id: paymentData?.booking_id || `${astrologerId}-${selectedDate}-${selectedSlot?.startTime}`,
        astrologerId,
        date: selectedDate,
        startTime: selectedSlot?.startTime,
        duration: selectedDuration,
        fee: selectedConsultationFee,
        price: selectedConsultationFee,
        consultationFee: selectedConsultationFee,
        astrologer: { name: serviceTitle },
        createdAt: new Date().toISOString(),
      };

      const existing = JSON.parse(window.localStorage.getItem("divyaum:astrology-bookings") || "[]");
      const next = Array.isArray(existing)
        ? [
            ...existing.filter(
              (item) => !(item?.astrologerId === astrologerId && item?.date === selectedDate && item?.startTime === selectedSlot?.startTime),
            ),
            localBooking,
          ]
        : [localBooking];
      window.localStorage.setItem("divyaum:astrology-bookings", JSON.stringify(next));
    }

    setSelectedSlotId("");
    setConfirmation("");
    setPaymentOpen(false);
    setPaymentData(null);
    router.push("/my-bookings?tab=astrology");
  };

  const handlePaymentFailure = (msg) => {
    setPaymentOpen(false);
    setPaymentData(null);
    setConfirmation(msg || "Payment was not completed. Your slot has been released.");
    refetchBookedSlots();
  };

  return (
    <section id="slots" className={styles.section} aria-label="Select consultation slot">
      <div className="container">
        <div className={styles.card}>

          <header className={styles.header}>
            <p className={styles.kicker}>Choose Your Slot</p>
            <h2 className={styles.title}>Book Your Astrology Consultation</h2>
            <p className={styles.lead}>
              Pick preferred date and duration. Available slots are shown from 10:00 AM to 7:00 PM.
            </p>
            <p className={styles.lead}>
              Once a time is booked, it stays blocked across all durations.
            </p>
          </header>

          <div className={styles.filters}>
            <label className={styles.filterField}>
              <span className={styles.label}>Date</span>
              <input
                className={styles.input}
                type="date"
                value={selectedDate}
                min={today}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlotId("");
                  setConfirmation("");
                }}
              />
            </label>

            <label className={styles.filterField}>
              <span className={styles.label}>Duration</span>
              <select
                className={styles.input}
                value={selectedDuration}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setSelectedDuration(next);
                  setSelectedSlotId("");
                  setConfirmation("");
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent(DURATION_SYNC_TO_PLANS, { detail: next }));
                  }
                }}
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d} mins</option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.summaryRow} aria-live="polite">
            <span className={styles.summaryChip}>Available: {availableSlotsCount}</span>
            <span className={styles.summaryChip}>Duration: {selectedDuration} mins</span>
          </div>

          <div className={styles.slotsWrap}>
            {slots
              .filter((slot) => {
                const isPast = hasMounted && isPastSlot(selectedDate, slot.startTime);
                return !isPast;
              })
              .map((slot) => {
                const isBooked = isSlotOverlapping(slot.startTime, selectedDuration, todayBookedRanges);
                const isSelected = selectedSlotId === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    className={`${styles.slotChip}
                      ${isSelected ? styles.slotChipActive : ""}
                      ${isBooked ? styles.slotChipBooked : ""}`.trim()}
                    disabled={isBooked}
                    onClick={() => {
                      setSelectedSlotId((prev) => (prev === slot.id ? "" : slot.id));
                      setConfirmation("");
                    }}
                  >
                    <span>{slot.label}</span>
                    {isBooked && <span className={styles.slotMeta}>Booked</span>}
                  </button>
                );
              })}
          </div>

          <div className={styles.footer}>
            <Button
              type="button"
              className={styles.bookButton}
              onClick={onShowConfirmation}
              disabled={isBookingInProgress}
            >
              Book Selected Slot{" "}
              <span className={styles.arrow} aria-hidden="true">›</span>
            </Button>
            {confirmation ? (
              <div
                className={`${styles.feedback} ${confirmation.startsWith("✅") ? styles.feedbackSuccess : styles.feedbackError}`}
                role="alert"
                aria-live="polite"
              >
                <span className={styles.feedbackGlyph} aria-hidden="true">
                  {confirmation.startsWith("✅") ? "✓" : "!"}
                </span>
                <p className={styles.feedbackText}>{confirmation}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => !isBookingInProgress && setShowConfirmModal(false)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalCloseBtn}
              onClick={() => !isBookingInProgress && setShowConfirmModal(false)}
              disabled={isBookingInProgress}
            >✕</button>

            <div className={styles.modalIconWrap}>🪔</div>
            <p className={styles.modalKicker}>Confirm Your Booking</p>
            <h3 className={styles.modalTitle}>Review Details</h3>

            <div className={styles.confirmDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Astrologer</span>
                <span className={styles.detailValue}>{serviceTitle}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>
                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Time</span>
                <span className={styles.detailValue}>{selectedSlot?.label}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Duration</span>
                <span className={styles.detailValue}>{selectedDuration} mins</span>
              </div>
              {selectedConsultationFee > 0 && (
                <>
                  <div className={styles.detailDivider} />
                  <div className={`${styles.detailRow} ${styles.detailRowTotal}`}>
                    <span className={styles.detailLabel}>Consultation Fee</span>
                    <span className={styles.detailFee}>
                      ₹ {formatCurrency(selectedConsultationFee)}
                      {selectedDuration ? ` / ${selectedDuration} mins` : ""}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalButton}
                onClick={onBook}
                disabled={isBookingInProgress}
              >
                {isBookingInProgress ? "Booking..." : "Confirm & Book"}
              </button>
              <button
                type="button"
                className={styles.modalButtonSecondary}
                onClick={() => setShowConfirmModal(false)}
                disabled={isBookingInProgress}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <RazorpayCheckout
        open={paymentOpen}
        paymentData={paymentData}
        description={`Astrology consultation – ${serviceTitle}`}
        prefill={(() => {
          const user = getStoredUser();
          return { name: user?.name || "", email: user?.email || "" };
        })()}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onClose={() => {
          setPaymentOpen(false);
          setPaymentData(null);
          refetchBookedSlots();
        }}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultView={authView}
      />

      <PhoneRequiredModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onSaved={() => {
          setPhoneModalOpen(false);
          void submitAstrologerBooking();
        }}
      />
    </section>
  );
}