"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { getStoredToken, getStoredUserId } from "@/components/StoreProductCard/cartApi";
import { fetchCustomerOrderDetail, normalizeOrderLines } from "@/lib/orderApi";
import styles from "./orderDetail.module.scss";

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

function formatDateTime(value) {
  if (!value) return "—";
  const t = new Date(value);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeTrackingUrl(value) {
  const trackingUrl = value == null ? "" : String(value).trim();
  if (!trackingUrl) return "";

  try {
    const parsedUrl = new URL(trackingUrl);
    return ["http:", "https:"].includes(parsedUrl.protocol) ? trackingUrl : "";
  } catch {
    return "";
  }
}

function normalizeAddressFromOrder(order) {
  const a = order?.addressId;
  if (!a || typeof a !== "object") {
    return null;
  }
  return {
    line1: String(a.Line1 || "").trim(),
    line2: String(a.Line2 || "").trim(),
    city: String(a.city || "").trim(),
    state: String(a.state || "").trim(),
    country: String(a.country || "").trim(),
    pincode: String(a.Pincode ?? a.pincode ?? "").trim(),
  };
}

function formatAddressLines(addr) {
  if (!addr) return [];
  const street = [addr.line1, addr.line2].filter(Boolean).join(", ");
  const cityState = [addr.city, addr.state].filter(Boolean).join(", ");
  const tail = [addr.country, addr.pincode].filter(Boolean).join(" · ");
  return [street, cityState, tail].filter(Boolean);
}

function getStatusChipClass(status) {
  const s = String(status || "").toLowerCase().replace(/[\s_]+/g, "-");
  switch (s) {
    case "pending":
      return styles.statusChipPending;
    case "failed":
      return styles.statusChipFailed;
    case "cancelled":
      return styles.statusChipCancelled;
    case "out-for-delivery":
      return styles.statusChipOutForDelivery;
    case "delivered":
      return styles.statusChipDelivered;
    default:
      return "";
  }
}

export default function OrderDetailClient() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId ? String(params.orderId) : "";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = getStoredToken();
      const userId = getStoredUserId();

      if (!token || !userId) {
        router.replace("/login");
        return;
      }
      if (!orderId) {
        setError("Invalid order link.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCustomerOrderDetail({ token, orderId });
        if (!cancelled) {
          setOrder(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setOrder(null);
          setError(err?.message || "Could not load this order.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, orderId]);

  const lines = useMemo(() => (order ? normalizeOrderLines(order) : []), [order]);
  const address = useMemo(() => normalizeAddressFromOrder(order), [order]);
  const addressLines = useMemo(() => formatAddressLines(address), [address]);
  const trackingUrl = normalizeTrackingUrl(order?.trackingUrl);

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.toolbar}>
          <Link href="/my-orders" className={styles.backLink}>
            <span className={styles.backChev} aria-hidden>
              ←
            </span>
            My orders
          </Link>
        </div>

        {loading ? <div className={styles.stateBox}>Loading order…</div> : null}

        {!loading && error ? (
          <div className={styles.stateBoxError}>
            <p className={styles.errorText}>{error}</p>
            <Link href="/my-orders" className={styles.secondaryBtn}>
              Back to my orders
            </Link>
          </div>
        ) : null}

        {!loading && !error && order ? (
          <>
            <header className={styles.pageHead}>
              <div>
                <p className={styles.kicker}>Order</p>
                <h1 className={styles.title}>Order details</h1>
                <p className={styles.orderIdLine}>
                  <span className={styles.muted}>Order ID</span>
                  <code className={styles.orderId}>{order._id}</code>
                </p>
              </div>
              <div className={styles.headMeta}>
                <span className={`${styles.statusChip} ${getStatusChipClass(order?.status)}`}>
                  {order?.status || "ordered"}
                </span>
                <p className={styles.placed}>
                  <span className={styles.muted}>Placed</span>
                  <strong>{formatDateTime(order?.createdAt)}</strong>
                </p>
              </div>
            </header>

            <div className={styles.layout}>
              <section className={styles.panel} aria-labelledby="items-heading">
                <div className={styles.panelHead}>
                  <h2 id="items-heading" className={styles.panelTitle}>
                    Items ordered
                  </h2>
                  {trackingUrl ? (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.trackBtn}
                    >
                      Track Order
                    </a>
                  ) : null}
                </div>
                <ul className={styles.itemList}>
                  {lines.map((line) => (
                    <li key={line.key} className={styles.itemRow}>
                      <div className={styles.itemThumb}>
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          className={styles.itemImg}
                          sizes="96px"
                        />
                      </div>
                      <div className={styles.itemBody}>
                        <p className={styles.itemName}>{line.name}</p>
                        {line.description ? <p className={styles.itemDesc}>{line.description}</p> : null}
                        <div className={styles.itemFoot}>
                          <span className={styles.qtyPill}>Qty {line.quantity}</span>
                          <span className={styles.priceMeta}>
                            ₹ {formatCurrency(line.unitPrice)} each
                          </span>
                        </div>
                      </div>
                      <div className={styles.itemTotal}>
                        <strong>₹ {formatCurrency(line.lineTotal)}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <aside className={styles.side}>
                <section className={styles.panel} aria-labelledby="addr-heading">
                  <div className={styles.panelHead}>
                    <h2 id="addr-heading" className={styles.panelTitle}>
                      Deliver to
                    </h2>
                  </div>
                  {addressLines.length ? (
                    <div className={styles.addressCard}>
                      <span className={styles.pinIcon} aria-hidden>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <circle cx="12" cy="11" r="2.2" fill="currentColor" />
                        </svg>
                      </span>
                      <div className={styles.addressLines}>
                        {addressLines.map((row, idx) => (
                          <p key={`addr-${idx}`}>{row}</p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className={styles.emptyInline}>Delivery address is not available for this order.</p>
                  )}
                </section>

                <section className={`${styles.panel} ${styles.summaryPanel}`} aria-labelledby="sum-heading">
                  <div className={styles.panelHead}>
                    <h2 id="sum-heading" className={styles.panelTitle}>
                      Summary
                    </h2>
                  </div>
                  <dl className={styles.summaryList}>
                    <div className={styles.summaryRow}>
                      <dt>Subtotal</dt>
                      <dd>₹ {formatCurrency(order?.subtotal)}</dd>
                    </div>
                    <div className={styles.summaryRow}>
                      <dt>Shipping</dt>
                      <dd>₹ {formatCurrency(order?.shippingCharges)}</dd>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                      <dt>Total paid</dt>
                      <dd>₹ {formatCurrency(order?.total)}</dd>
                    </div>
                  </dl>
                </section>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
