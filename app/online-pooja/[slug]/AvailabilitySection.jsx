"use client";
import { useState } from "react";
import styles from "./page.module.scss";
import Button from "@/components/Button";
import BookingPopup from "@/components/BookingPopup/BookingPopup";
import { useEffect } from "react";
import {useRouter} from "next/navigation";
import AuthModal from "@/components/AuthModal/AuthModal";
import RazorpayCheckout from "@/components/RazorpayCheckout/RazorpayCheckout";

export default function AvailabilitySection({ poojaId, availability, pooja }) {
  const [slots, setSlots] = useState(availability);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [validationMsg, setValidationMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("selectedPackage");
  }, []);

  const selectedSlots = selectedDate
    ? slots.filter((slot) => slot.date.split("T")[0] === selectedDate)
    : [];

  const uniqueDates = [];
  const seen = new Set();
  for (const slot of slots) {
    const dateKey = slot.date.split("T")[0];
    if (!seen.has(dateKey)) {
      seen.add(dateKey);
      uniqueDates.push({ ...slot, dateKey });
    }
  }

  const handleDateClick = (dateKey) => {
    setSelectedDate(dateKey);
    setSelectedSlotId(null);
    setValidationMsg("");
  };

  const handleBookClick = (slotId) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    if (!user || !token) {
      // setValidationMsg("Please login first to book a pooja.");
      setAuthView("login");
      setAuthOpen(true);
      return;
    }


    const selectedPackage = JSON.parse(localStorage.getItem("selectedPackage") || "null");
    if (!selectedPackage || !selectedPackage.id) {
      // localStorage.removeItem("selectedPackage");
      setValidationMsg("Please select a package before booking.");
      setShowPopup(false);

      return;
    }

    setSelectedSlotId(slotId);
    setValidationMsg("");
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };


  const handleConfirm = async (formData, onSuccess) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    const selectedPackage = JSON.parse(localStorage.getItem("selectedPackage") || "null");


    if (!selectedPackage || !selectedPackage.id) {
      setValidationMsg("Please select a package before booking.");
      setShowPopup(false);
      return;
    }

    const slot = slots.find((s) => s._id === selectedSlotId);
    if (!slot) return;

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:4000";

      const res = await fetch(`${baseUrl}/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id || "",
          poojaId: poojaId,
          slotId: slot._id,
          packageId: selectedPackage.id,

          countryCode: "91",
          phoneNumber: formData.whatsapp,
          gotraName: formData.gotra,
          memberAddress: `${formData.address}, ${formData.state}, ${formData.pincode}`,
          poojaMembersName: [
            formData.member1,
            formData.member2,
          ].filter(Boolean),
        }),
      });

      const json = await res.json();

      if (res.ok) {
        onSuccess();

        setPaymentData({
          key: json.key,
          order_id: json.order_id,
          amount: json.amount,
          currency: json.currency || "INR",
          booking_id: json.booking_id,
        });
        setPaymentOpen(true);
      } else {
        setValidationMsg(json?.message || "Booking failed. Please try again.");
        setShowPopup(false);
      }
    } catch (error) {
      console.error("BOOK ERROR:", error);
      setValidationMsg("Something went wrong. Please try again.");
      setShowPopup(false);
    }
  };

  const handlePaymentSuccess = () => {
    setSlots((prev) =>
      prev.map((s) =>
        s._id === selectedSlotId ? { ...s, isBooked: true } : s
      )
    );
    localStorage.removeItem("selectedPackage");
    setPaymentOpen(false);
    setPaymentData(null);
    router.push("/my-bookings");
  };

  const handlePaymentFailure = (msg) => {
    setPaymentOpen(false);
    setPaymentData(null);
    setValidationMsg(msg || "Payment was not completed. Please try again.");
  };

  const selectedSlotData = slots.find((s) => s._id === selectedSlotId);
  const selectedPackage = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("selectedPackage") || "null")
    : null;

  return (
    <section className={styles.availabilitySection} aria-label="Available dates">
      <div className="container">
        <div className={styles.availabilityCard}>

          <div className={styles.availabilityHead}>
            <div>
              <p className={styles.availabilityKicker}>Availability</p>
              <h2 className={styles.availabilityTitle}>Available Dates</h2>
            </div>
            <p className={styles.availabilityHint}>
              Pick the best muhurat (booked slots are greyed out).
            </p>
          </div>

          {validationMsg && (
            <div
              className={`${styles.validationMsg} ${validationMsg.startsWith("✅") ? styles.validationSuccess : styles.validationError}`}
              role="alert"
              aria-live="polite"
            >
              <span className={styles.validationGlyph} aria-hidden="true">
                {validationMsg.startsWith("✅") ? "✓" : "!"}
              </span>
              <p className={styles.validationText}>{validationMsg}</p>
            </div>
          )}

          <div className={styles.availabilityGrid}>
            {uniqueDates.map((dateSlot) => {
              const dateKey = dateSlot.dateKey;
              const allSlotsForDate = slots.filter(
                (s) => s.date.split("T")[0] === dateKey
              );
              const allBooked = allSlotsForDate.every((s) => s.isBooked);
              const availableCount = allSlotsForDate.filter((s) => !s.isBooked).length;
              const weekday = new Date(dateSlot.date).toLocaleDateString("en-IN", {
                weekday: "short",
              });
              const isSelected = selectedDate === dateKey;

              return (
                <button
                  type="button"
                  key={dateKey}
                  className={`${styles.dateTile} ${allBooked ? styles.dateTileBooked : ""} ${isSelected ? styles.dateTileSelected : ""}`.trim()}
                  onClick={() => handleDateClick(dateKey)}
                  disabled={allBooked}
                >
                  <div className={styles.dateTopRow}>
                    <span className={styles.dateWeekday}>{weekday}</span>
                    <span className={allBooked ? styles.dateBadge : styles.dateBadgeFree}>
                      {allBooked ? "Booked" : `${availableCount} Slots`}
                    </span>
                  </div>
                  <p className={styles.dateValue}>{dateKey}</p>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className={styles.timeSlotCard}>
              <div className={styles.timeSlotHead}>
                <h3 className={styles.timeSlotTitle}>
                  Time Slots for {selectedDate}
                </h3>
                <span className={styles.timeSlotMeta}>
                  {selectedSlots.filter((slot) => !slot.isBooked).length} available
                </span>
              </div>
              {selectedSlots.length === 0 && (
                <div className={styles.timeSlotEmpty}>No slots found.</div>
              )}
              <ul className={styles.timeSlotList}>
                {selectedSlots.map((slot) => (
                  <li
                    key={slot._id}
                    className={`${styles.timeSlotItem} ${selectedSlotId === slot._id ? styles.timeSlotItemSelected : ""}`}
                    onClick={() => !slot.isBooked && setSelectedSlotId(slot._id)}
                    style={{ cursor: slot.isBooked ? "not-allowed" : "pointer" }}
                  >
                    <div className={styles.timeSlotLeft}>
                      <label className={styles.timeSlotLabel}>
                        <input
                          type="radio"
                          name="timeSlot"
                          className={styles.timeSlotRadio}
                          checked={selectedSlotId === slot._id}
                          disabled={slot.isBooked}
                          onChange={() => !slot.isBooked && setSelectedSlotId(slot._id)}
                        />
                        <span className={styles.timeSlotTime}>{slot.time}</span>
                      </label>
                    </div>

                    {slot.isBooked ? (
                      <span className={styles.timeSlotBooked}>Booked</span>
                    ) : (
                      <div className={styles.timeSlotActions}>
                        <span className={styles.timeSlotAvailable}>Available</span>
                        <Button
                          className={styles.dateBookBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookClick(slot._id);
                          }}
                        >
                          Book
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>

      {showPopup && (
        <BookingPopup
          pooja={pooja}
          slot={selectedSlotData}
          pkg={selectedPackage}
          onClose={handleClosePopup}
          onConfirm={handleConfirm}
        />
      )}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultView={authView}
      />

      <RazorpayCheckout
        open={paymentOpen}
        paymentData={paymentData}
        description={`Pooja booking – ${pooja?.name || pooja?.title || "Pooja"}`}
        prefill={(() => {
          try {
            const user = JSON.parse(localStorage.getItem("user") || "null");
            return { name: user?.name || "", email: user?.email || "" };
          } catch {
            return {};
          }
        })()}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onClose={() => {
          setPaymentOpen(false);
          setPaymentData(null);
        }}
      />

    </section>
  );
}