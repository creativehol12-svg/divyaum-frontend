"use client";

import { useEffect, useState } from "react";
import styles from "./BookingModal.module.scss";
import { addBooking } from "./bookingStorage";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year, month, day) {
  const date = new Date(year, month, day);
  return date.toISOString().split("T")[0];
}

export default function BookingModal({ pooja, packageData, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isBooking, setIsBooking] = useState(false);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();
  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((prev) => prev - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((prev) => prev + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (day) => {
    if (day < todayDate) {
      return;
    }
    setSelectedDate(day);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    setIsBooking(true);

    setTimeout(() => {
      const bookingDate = formatDate(currentYear, currentMonth, selectedDate);
      const booking = addBooking({
        poojaSlug: pooja.slug,
        poojaTitle: pooja.title,
        packageTitle: packageData.title,
        packagePrice: packageData.price,
        bookedDate: bookingDate,
      });

      setIsBooking(false);
      onSuccess(booking);
    }, 600);
  };

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-label="Book pooja"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className={styles.modalHeader}>
          <p className={styles.kicker}>Book Your Pooja</p>
          <h3 className={styles.title}>{pooja.title}</h3>
          <p className={styles.packageInfo}>
            {packageData.title} • ₹ {packageData.price}
          </p>
        </div>

        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <button type="button" onClick={handlePrevMonth} aria-label="Previous month">
              ‹
            </button>
            <h4 className={styles.monthYear}>
              {monthNames[currentMonth]} {currentYear}
            </h4>
            <button type="button" onClick={handleNextMonth} aria-label="Next month">
              ›
            </button>
          </div>

          <div className={styles.weekDays}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.calendarDays}>
            {calendarDays.map((day, index) => {
              const isPastDay = isCurrentMonth && day < todayDate;
              const isSelected = day === selectedDate;
              const isToday = isCurrentMonth && day === todayDate;

              return (
                <button
                  key={index}
                  type="button"
                  className={`${styles.calendarDay} ${isPastDay ? styles.disabled : ""} ${
                    isSelected ? styles.selected : ""
                  } ${isToday ? styles.today : ""}`}
                  onClick={() => !isPastDay && day && handleSelectDate(day)}
                  disabled={isPastDay || !day}
                  aria-label={day ? `${day} ${monthNames[currentMonth]}` : ""}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.modalFooter}>
          {selectedDate && (
            <p className={styles.selectedInfo}>
              Selected: <strong>{monthNames[currentMonth]} {selectedDate}, {currentYear}</strong>
            </p>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleConfirmBooking}
              disabled={!selectedDate || isBooking}
            >
              {isBooking ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
