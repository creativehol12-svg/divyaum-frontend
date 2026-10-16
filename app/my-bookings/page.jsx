"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button";

import styles from "./page.module.scss";

/* ----------------------------- Helpers ----------------------------- */

function formatDate(dateStr) {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateOnly(dateStr) {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function normalizeMinutes(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 15;
}

function formatTimeRange(startTime, duration = 15) {
  if (!startTime) return "—";

  const [hours, mins] = String(startTime).split(":").map(Number);

  if (isNaN(hours) || isNaN(mins)) return startTime;

  const start = new Date();
  start.setHours(hours, mins, 0);

  const end = new Date(start.getTime() + duration * 60000);

  return `${start.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} – ${end.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

function normalizeImageSrc(src, fallback) {
  if (!src) return fallback;

  if (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src;
  }

  return `/${src}`;
}

function formatFeeDisplay(value) {
  const fee = Number(value);

  if (!fee || fee <= 0) return "";

  return `₹${fee.toLocaleString("en-IN")}`;
}

/* ----------------------------- Fee Logic ----------------------------- */

function getAstrologyPrice(booking) {
  // direct values
  const directPrice =
    booking?.price ||
    booking?.fee ||
    booking?.amount ||
    booking?.consultationFee ||
    booking?.totalAmount;

  if (directPrice) {
    return Number(directPrice);
  }

  // duration wise fees
  const duration = normalizeMinutes(
    booking?.duration || booking?.minutes
  );

  const fees =
    booking?.fees ||
    booking?.astrologer?.fees ||
    [];

  if (Array.isArray(fees) && fees.length > 0) {
    const matchedFee =
      fees.find(
        (item) =>
          Number(item?.minutes || item?.duration) === duration
      ) || fees[0];

    return Number(
      matchedFee?.price ||
      matchedFee?.fee ||
      matchedFee?.amount ||
      0
    );
  }

  return 0;
}

/* ----------------------------- Normalize ----------------------------- */

function normalizeBookingList(payload) {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== "object") return [];

  return (
    payload?.data ||
    payload?.bookings ||
    payload?.results ||
    payload?.items ||
    payload?.myBookings ||
    []
  );
}

function readLocalAstrologyBookings() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(
      "divyaum:astrology-bookings"
    );

    const parsed = JSON.parse(stored || "[]");

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const FAILED_STATUSES = new Set(["pending", "failed"]);

function isBookingSuccessful(booking) {
  const status = String(booking?.status ?? "").toLowerCase();
  if (!status) return true;
  return !FAILED_STATUSES.has(status);
}

function mergeAstrologyBookings(apiBookings, localBookings) {
  const map = new Map();

  // API bookings add
  apiBookings.forEach((booking) => {
    const key = [
      booking?.date,
      booking?.startTime,
      booking?.name || booking?.astrologer?.name,
    ].join("-");

    const existing = map.get(key);

    map.set(key, {
      ...existing,
      ...booking,

      // preserve values
      price:
        booking?.price ||
        existing?.price,

      fee:
        booking?.fee ||
        existing?.fee,

      createdAt:
        booking?.createdAt ||
        existing?.createdAt,
    });
  });

  // Local bookings merge
  localBookings.forEach((booking) => {
    const key = [
      booking?.date,
      booking?.startTime,
      booking?.name || booking?.astrologer?.name,
    ].join("-");

    const existing = map.get(key);

    map.set(key, {
      ...booking,
      ...existing,

      // keep best values
      price:
        existing?.price ||
        booking?.price,

      fee:
        existing?.fee ||
        booking?.fee,

      createdAt:
        existing?.createdAt ||
        booking?.createdAt,
    });
  });

  return Array.from(map.values()).filter(isBookingSuccessful);
}

/** @returns {number | null} */
function tryParseTime(value) {
  if (value == null || value === "") return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Newest-first ordering. Prefers created/booked time, then updatedAt, then scheduled slot date/time.
 */
function bookingSortTimestamp(booking, isAstrology) {
  if (!booking || typeof booking !== "object") return 0;

  const created =
    tryParseTime(booking.createdAt) ??
    tryParseTime(booking.created_at) ??
    tryParseTime(booking.bookedAt) ??
    tryParseTime(booking.booked_at);
  if (created != null) return created;

  const updated =
    tryParseTime(booking.updatedAt) ?? tryParseTime(booking.updated_at);
  if (updated != null) return updated;

  const dateStr = isAstrology
    ? booking.date
    : booking?.slot?.date || booking?.date;
  const timeStr = isAstrology
    ? booking?.startTime
    : booking?.slot?.time || booking?.slot?.startTime;

  if (dateStr && timeStr) {
    const combined = tryParseTime(`${String(dateStr).trim()} ${String(timeStr).trim()}`);
    if (combined != null) return combined;
  }
  if (dateStr) {
    const d = tryParseTime(String(dateStr).trim());
    if (d != null) return d;
  }
  return 0;
}

function sortBookingsNewestFirst(list, isAstrology) {
  if (!Array.isArray(list) || list.length === 0) return [];
  if (list.length === 1) return [...list];
  return [...list].sort((a, b) => {
    const ta = bookingSortTimestamp(a, isAstrology);
    const tb = bookingSortTimestamp(b, isAstrology);
    if (tb !== ta) return tb - ta;
    const ida = String(a?._id ?? a?.bookingId ?? a?.id ?? "");
    const idb = String(b?._id ?? b?.bookingId ?? b?.id ?? "");
    return idb.localeCompare(ida);
  });
}

/* ----------------------------- Card ----------------------------- */

function BookingCard({ booking, index, type }) {
  const pooja = booking?.pooja;
  const slot = booking?.slot || {};

  const isAstrology = type === "astrology";

  const image = isAstrology
    ? normalizeImageSrc(
      booking?.image || booking?.astrologer?.image,
      ""
    )
    : normalizeImageSrc(
      pooja?.featuredImage,
      "/pooja/pooja-1.png"
    );

  const title = isAstrology
    ? booking?.name ||
    booking?.astrologer?.name ||
    "Astrology Consultation"
    : pooja?.name || "Pooja";

  const duration = normalizeMinutes(
    booking?.duration ||
    booking?.minutes ||
    slot?.duration ||
    15
  );

  const price = getAstrologyPrice(booking);

  const details = booking?.bookingDetails || {};

  const gotra = details?.gotraName;

  const members =
    details?.poojaMembersName?.length ||
    details?.membersCount;

  const whatsapp =
    details?.phoneNumber ||
    details?.mobileNumber ||
    details?.whatsappNumber;

  const [cardImage, setCardImage] = useState(image);

  useEffect(() => {
    setCardImage(image);
  }, [image]);

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={styles.cardImageWrap}>
        <Image
          src={cardImage}
          alt={title}
          fill
          sizes="120px"
          className={styles.cardImage}
          onError={() =>
            setCardImage("/panditji/panditji2.jpg")
          }
        />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div>
            <span className={styles.cardType}>
              {isAstrology
                ? "Astrology Booking"
                : "Pooja Booking"}
            </span>

            <h3 className={styles.cardTitle}>
              {title}
            </h3>
          </div>
        </div>

        <div className={styles.cardMeta}>
          {/* Astrology */}

          {isAstrology && (
            <>
              <div className={styles.metaItem}>
                <span>
                  📅 {formatDateOnly(booking?.date)}
                </span>
              </div>

              <div className={styles.metaItem}>
                <span>
                  🕐{" "}
                  {formatTimeRange(
                    booking?.startTime,
                    duration
                  )}
                </span>
              </div>

              <div className={styles.metaItem}>
                <span>
                  ⏱️ Duration: {duration} mins
                </span>
              </div>

              {price > 0 && (
                <div className={styles.metaItem}>
                  <span>
                    💰 {formatFeeDisplay(price)}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Pooja */}

          {!isAstrology && booking?.package && (
            <div className={styles.metaItem}>
              <span>
                {booking.package.name} — ₹
                {booking.package.price?.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          )}

          {!isAstrology &&
            (booking?.slot?.date || booking?.date) && (
              <div className={styles.metaItem}>
                <span>
                  📅{" "}
                  {formatDateOnly(
                    booking?.slot?.date || booking?.date
                  )}
                </span>
              </div>
            )}

          {(booking?.slot?.time ||
            booking?.slot?.startTime) && (
              <div className={styles.metaItem}>
                <span>
                  🕐{" "}
                  {booking?.slot?.time ||
                    booking?.slot?.startTime}
                </span>
              </div>
            )}

          {/* Booked Date */}

          <div className={styles.metaItem}>
            <span>
              Booked on{" "}
              {formatDate(booking?.createdAt)}
            </span>
          </div>

          {/* Pooja Extra Info */}

          {!isAstrology &&
            (gotra || members || whatsapp) && (
              <div className={styles.infoRow}>
                {gotra && (
                  <span
                    className={styles.infoBadge}
                  >
                    🧬 {gotra}
                  </span>
                )}

                {members && (
                  <span
                    className={styles.infoBadge}
                  >
                    👨‍👩‍👧‍👦 {members} Members
                  </span>
                )}

                {whatsapp && (
                  <span
                    className={styles.infoBadge}
                  >
                    📱 {whatsapp}
                  </span>
                )}
              </div>
            )}
        </div>
      </div>
    </article>
  );
}

/* ----------------------------- Main Page ----------------------------- */

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [astrologerBookings, setAstrologerBookings] =
    useState([]);

  const [filterType, setFilterType] =
    useState("pooja");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const router = useRouter();

  /* ----------------------------- URL Tab ----------------------------- */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");

    if (tab === "astrology") {
      setFilterType("astrology");
    }
  }, []);

  /* ----------------------------- Fetch ----------------------------- */

  useEffect(() => {
    async function fetchBookings() {
      try {
        const user = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        const token = localStorage.getItem("token");

        if (!user && !token) {
          router.push("/login");
          return;
        }

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:4000";

        /* Pooja */

        const poojaRes = await fetch(
          `${baseUrl}/api/pooja/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (poojaRes.ok) {
          const poojaData = await poojaRes.json();

          setBookings(
            normalizeBookingList(poojaData).filter(isBookingSuccessful)
          );
        }

        /* Astrology */

        const astroRes = await fetch(
          `${baseUrl}/api/astrologer/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(() => null);

        if (astroRes?.ok) {
          const astroData = await astroRes.json();

          const apiBookings =
            normalizeBookingList(astroData);

          const localBookings =
            readLocalAstrologyBookings();

          setAstrologerBookings(
            mergeAstrologyBookings(
              apiBookings,
              localBookings
            )
          );
          localStorage.removeItem(
            "divyaum:astrology-bookings"
          );
        } else {
          setAstrologerBookings(
            readLocalAstrologyBookings()
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load bookings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [router]);

  const filteredBookings = useMemo(
    () =>
      sortBookingsNewestFirst(
        filterType === "pooja" ? bookings : astrologerBookings,
        filterType === "astrology",
      ),
    [filterType, bookings, astrologerBookings],
  );

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className="container">
          {/* Header */}

          <div className={styles.pageHeader}>
            <div>
              <p className={styles.kicker}>
                Dashboard
              </p>

              <h1 className={styles.title}>
                My Bookings
              </h1>

              <p className={styles.subtitle}>
                All your pooja and astrology
                bookings in one place.
              </p>
            </div>

            <Button
              href="/online-pooja"
              as="a"
              variant="unstyled"
              className={styles.ctaBtn}
            >
              Book a Pooja ›
            </Button>
          </div>

          {/* Tabs */}

          <div className={styles.filterWrap}>
            <button
              className={`${styles.filterBtn} ${filterType === "pooja"
                ? styles.filterBtnActive
                : ""
                }`}
              onClick={() =>
                setFilterType("pooja")
              }
            >
              Pooja Bookings
            </button>

            <button
              className={`${styles.filterBtn} ${filterType === "astrology"
                ? styles.filterBtnActive
                : ""
                }`}
              onClick={() =>
                setFilterType("astrology")
              }
            >
              Astrology Consultations
            </button>
          </div>

          {/* Loading */}

          {loading && (
            <div className={styles.stateWrap}>
              <p>Loading your bookings...</p>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className={styles.stateWrap}>
              <p className={styles.errorMsg}>
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Empty */}

          {!loading &&
            !error &&
            filteredBookings.length === 0 && (
              <div className={styles.emptyWrap}>
                <h2>No bookings found</h2>

                <Link
                  href={
                    filterType === "pooja"
                      ? "/online-pooja"
                      : "/online-astrology"
                  }
                  className={styles.ctaBtn}
                >
                  Explore Now ›
                </Link>
              </div>
            )}

          {/* Cards */}

          {!loading &&
            !error &&
            filteredBookings.length > 0 && (
              <div className={styles.bookingsList}>
                <p className={styles.count}>
                  {filteredBookings.length}{" "}
                  {filterType} booking
                  {filteredBookings.length > 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>

                <div className={styles.cards}>
                  {filteredBookings.map(
                    (booking, index) => (
                      <BookingCard
                        key={
                          booking?._id ||
                          booking?.bookingId ||
                          index
                        }
                        booking={booking}
                        index={index}
                        type={filterType}
                      />
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
}