const BOOKINGS_STORAGE_KEY = "divyaum:pooja-bookings";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function readBookings() {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeBookings(bookings) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
}

export function addBooking(booking) {
  const currentBookings = readBookings();
  const newBooking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    ...booking,
  };

  const nextBookings = [...currentBookings, newBooking];
  writeBookings(nextBookings);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("divyaum-booking-created"));
  }

  return newBooking;
}
