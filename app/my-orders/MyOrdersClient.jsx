"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getStoredToken, getStoredUserId } from "@/components/StoreProductCard/cartApi";
import { fetchCustomerOrders } from "@/lib/orderApi";
import styles from "./page.module.scss";

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

function formatOrderTime(value) {
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

function normalizeProducts(order) {
  const lines = Array.isArray(order?.products) ? order.products : [];
  if (!lines.length) {
    return [
      {
        image: "/icon/logo-removebg-preview.png",
      },
    ];
  }
  return lines.map((line) => {
    const product = line?.productId || {};
    return {
      image: product?.image || "/icon/logo-removebg-preview.png",
    };
  });
}

function sortLatestFirst(list) {
  return [...list].sort((a, b) => {
    const ta = new Date(a?.createdAt || 0).getTime();
    const tb = new Date(b?.createdAt || 0).getTime();
    if (tb !== ta) return tb - ta;
    return String(b?._id || "").localeCompare(String(a?._id || ""));
  });
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

export default function MyOrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      const token = getStoredToken();
      const userId = getStoredUserId();

      if (!token || !userId) {
        router.replace("/login");
        return;
      }

      try {
        const { orders: list } = await fetchCustomerOrders({ token, userId });
        if (!cancelled) {
          setOrders(sortLatestFirst(list));
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Could not load your orders.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const cards = useMemo(
    () =>
      orders.map((order) => ({
        order,
        products: normalizeProducts(order),
      })),
    [orders],
  );

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.head}>
          <div>
            <p className={styles.kicker}>Profile</p>
            <h1 className={styles.title}>My Orders</h1>
            <p className={styles.subtitle}>Newest orders first. Open any order to see items, quantities, and delivery address.</p>
          </div>
          <Link href="/cart" className={styles.backLink}>
            Back to cart
          </Link>
        </div>

        {loading ? <div className={styles.stateBox}>Loading your orders...</div> : null}
        {!loading && error ? <div className={styles.stateBoxError}>{error}</div> : null}

        {!loading && !error && cards.length === 0 ? (
          <div className={styles.stateBox}>No orders found yet.</div>
        ) : null}

        {!loading && !error && cards.length > 0 ? (
          <div className={styles.grid}>
            {cards.map(({ order, products }) => (
              <Link
                key={order._id}
                href={`/my-orders/${String(order._id)}`}
                className={`${styles.card} ${styles.cardClickable}`}
                aria-label="View order details"
              >
                  <div className={styles.cardHeadRow}>
                    <div className={styles.orderIdWrap}>
                      <span className={styles.orderIdLabel}>Order ID</span>
                      <p className={styles.orderIdValue}>{order?._id || "—"}</p>
                    </div>
                    <span className={`${styles.statusChip} ${getStatusChipClass(order?.status)}`}>{order?.status || "ordered"}</span>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.metaRow}>
                    <p className={styles.metaItem}>
                      <span>Order time</span>
                      <strong>{formatOrderTime(order?.createdAt)}</strong>
                    </p>
                    <p className={styles.metaItemtotal}>
                      <span>Total</span>
                      <strong>₹ {formatCurrency(order?.total)}</strong>
                    </p>
                  </div>

                  <div className={styles.productsList}>
                    {products.map((product, idx) => (
                      <div key={`${order._id}-${idx}-${product.image}`} className={styles.productRow}>
                        <div className={styles.thumbWrap}>
                          <Image src={product.image} alt="Ordered product" fill className={styles.thumb} sizes="100px" />
                        </div>
                      </div>
                    ))}
                  </div>

              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

