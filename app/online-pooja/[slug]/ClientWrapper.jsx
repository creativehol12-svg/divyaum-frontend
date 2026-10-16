"use client";

import { useEffect, useState } from "react";
import BookingModal from "@/components/Booking/BookingModal";
import BookingSuccess from "@/components/Booking/BookingSuccess";

export default function ClientWrapper({ pooja, packageTiers, children, styles }) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [successBooking, setSuccessBooking] = useState(null);

  useEffect(() => {
    const handleBookClick = (event) => {
      const bookPoojaBtn = event.target.closest("[data-book-pooja]");
      const bookPackageBtn = event.target.closest("[data-book-package]");

      if (bookPoojaBtn) {
        setSelectedPackage(pooja.packages[0]);
        setShowBookingModal(true);
      } else if (bookPackageBtn) {
        const packageIndex = Number(bookPackageBtn.dataset.packageIndex) || 0;
        setSelectedPackage(pooja.packages[packageIndex]);
        setShowBookingModal(true);
      }
    };

    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.addEventListener("click", handleBookClick);
      return () => mainElement.removeEventListener("click", handleBookClick);
    }
  }, [pooja]);

  return (
    <>
      {children}

      {showBookingModal && selectedPackage && (
        <BookingModal
          pooja={pooja}
          packageData={selectedPackage}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={(booking) => {
            setSuccessBooking(booking);
            setShowBookingModal(false);
            setSelectedPackage(null);
          }}
        />
      )}

      {successBooking && (
        <BookingSuccess
          booking={successBooking}
          onClose={() => setSuccessBooking(null)}
        />
      )}
    </>
  );
}
