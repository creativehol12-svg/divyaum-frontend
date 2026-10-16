"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddressAddModal from "@/components/AddressAddModal/AddressAddModal";
import AddressCard from "@/components/AddressCard/AddressCard";
import AuthModal from "@/components/AuthModal/AuthModal";
import RazorpayCheckout from "@/components/RazorpayCheckout/RazorpayCheckout";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.scss";
import Button from "@/components/Button";
import {
  clearLegacyCartLocalStorage,
  enrichGuestCartForDisplay,
  fetchCartSnapshotFromApi,
  getClientCartSnapshot,
  hydrateCartFromServerIfLoggedIn,
  isCartLoggedIn,
  getStoredToken,
  getStoredUserId,
  setClientCartSnapshot,
  updateCartLineQuantity,
} from "@/components/StoreProductCard/cartApi";
import {
  addCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  updateCustomerAddress,
} from "@/lib/addressApi";
import { createCustomerOrder } from "@/lib/orderApi";
import { userHasPhoneOnFile } from "@/lib/userPhoneApi";
import PhoneRequiredModal from "@/components/PhoneRequiredModal/PhoneRequiredModal";

// const quickPicks = [
//   {
//     title: "Brass Diya Set",
//     description: "Ideal for aarti and home mandir setup.",
//     href: "/divya-store",
//   },
//   {
//     title: "Griha Shanti Havan Mix",
//     description: "Add a more complete havan bundle.",
//     href: "/divya-store",
//   },
//   {
//     title: "Sphatik Mala",
//     description: "A refined option for deeper jap practice.",
//     href: "/divya-store",
//   },
// ];

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

function getDefaultNote(item) {
  if (item.weight) {
    return `${item.weight} ritual pack ready for your order.`;
  }

  return "Chosen for your spiritual essentials bundle.";
}

export default function CartClient() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isSyncingCart, setIsSyncingCart] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressEditRecord, setAddressEditRecord] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [addressesSectionError, setAddressesSectionError] = useState("");
  const [isLoadingSavedAddresses, setIsLoadingSavedAddresses] = useState(true);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [cartId, setCartId] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  const getItemKey = (item) =>
    item.productId || [item.name, item.weight, item.image].join("::");

  const isServerCart = () => isCartLoggedIn();
  const loadingCartMessage = "Loading your cart…";

  const refreshCartFromServer = async () => {
    const userId = getStoredUserId();
    const token = getStoredToken();
    if (!userId || !token) return;

    const snapshot = await fetchCartSnapshotFromApi(userId, token);
    setCartId(snapshot.cartId || "");
    setCartItems(snapshot.items);
    setClientCartSnapshot(snapshot.items);
  };

  const handleRemoveItem = async (item) => {
    if (!item.productId && !item.slug) return;

    setIsSyncingCart(true);
    try {
      await updateCartLineQuantity(item, 0);
      if (isServerCart()) {
        await refreshCartFromServer();
      } else {
        setCartItems(await enrichGuestCartForDisplay());
      }
    } catch (error) {
      console.error("Cart remove failed:", error);
      if (isServerCart()) {
        try {
          await refreshCartFromServer();
        } catch (refreshError) {
          console.error(refreshError);
        }
      }
    } finally {
      setIsSyncingCart(false);
    }
  };

  const handleStepQuantity = async (item, delta) => {
    const current = Number(item.quantity ?? 1);
    const next = Math.max(1, Math.min(99, current + delta));
    if (next === current) return;

    if (!item.productId && !item.slug) return;

    setIsSyncingCart(true);
    try {
      await updateCartLineQuantity(item, next);
      if (isServerCart()) {
        await refreshCartFromServer();
      } else {
        setCartItems(await enrichGuestCartForDisplay());
      }
    } catch (error) {
      console.error("Cart quantity update failed:", error);
      if (isServerCart()) {
        try {
          await refreshCartFromServer();
        } catch (refreshError) {
          console.error(refreshError);
        }
      }
    } finally {
      setIsSyncingCart(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const syncCartFromSnapshot = () => {
      if (isCartLoggedIn()) {
        setCartItems(getClientCartSnapshot());
        return;
      }
      void enrichGuestCartForDisplay().then((items) => {
        if (mounted) setCartItems(items);
      });
    };

    const loadCart = async () => {
      if (!isCartLoggedIn()) {
        setCartId("");
        await hydrateCartFromServerIfLoggedIn();
        if (mounted) {
          const items = await enrichGuestCartForDisplay();
          setCartItems(items);
          setIsLoadingCart(false);
        }
        return;
      }

      try {
        await hydrateCartFromServerIfLoggedIn();
        const snapshot = await fetchCartSnapshotFromApi();
        if (!mounted) return;

        setCartId(snapshot.cartId || "");
        setCartItems(snapshot.items);
        setClientCartSnapshot(snapshot.items);
      } catch (error) {
        console.error("Failed to load cart from API:", error);
        if (mounted) {
          syncCartFromSnapshot();
        }
      } finally {
        if (mounted) {
          setIsLoadingCart(false);
        }
      }
    };

    loadCart();

    const handleUserUpdated = () => {
      void loadCart();
    };

    window.addEventListener("divyaum-cart-updated", syncCartFromSnapshot);
    window.addEventListener("userUpdated", handleUserUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("divyaum-cart-updated", syncCartFromSnapshot);
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSavedAddresses = async () => {
      const userId = getStoredUserId();
      const token = getStoredToken();
      if (!userId || !token) {
        if (!cancelled) {
          setSavedAddresses([]);
          setIsLoadingSavedAddresses(false);
        }
        return;
      }

      if (!cancelled) {
        setAddressesSectionError("");
      }

      try {
        const { addresses: list } = await fetchCustomerAddresses({ userId, token });
        if (!cancelled) {
          setSavedAddresses(list);
        }
      } catch (err) {
        if (!cancelled) {
          setAddressesSectionError(err?.message || "Could not load saved addresses.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSavedAddresses(false);
        }
      }
    };

    void loadSavedAddresses();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (savedAddresses.length === 0) {
      setSelectedSavedAddressId(null);
      return;
    }
    setSelectedSavedAddressId((prev) =>
      prev && savedAddresses.some((a) => a.id === prev) ? prev : savedAddresses[0].id,
    );
  }, [savedAddresses]);

  const handleRemoveSavedAddress = async (id) => {
    const token = getStoredToken();
    if (!token) {
      setAddressesSectionError("Please sign in again to remove an address.");
      return;
    }
    setAddressesSectionError("");
    setDeletingAddressId(id);
    let closeModalAfter = false;
    try {
      await deleteCustomerAddress({ token, addressId: id });
      setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
      setAddressEditRecord((er) => {
        if (er?.id === id) {
          closeModalAfter = true;
          return null;
        }
        return er;
      });
      if (closeModalAfter) {
        setAddressModalOpen(false);
      }
    } catch (err) {
      setAddressesSectionError(err?.message || "Could not delete address.");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const closeAddressModal = () => {
    setAddressModalOpen(false);
    setAddressEditRecord(null);
    setAddressesSectionError("");
  };

  const openAddressAddModal = () => {
    setAddressesSectionError("");
    setAddressEditRecord(null);
    setAddressModalOpen(true);
  };

  const openAddressEditModal = (row) => {
    setAddressesSectionError("");
    setAddressEditRecord(row);
    setAddressModalOpen(true);
  };

  const createAddress = useCallback(async (fields) => {
    const userId = getStoredUserId();
    const token = getStoredToken();
    return addCustomerAddress({ userId, token, ...fields });
  }, []);

  const updateAddress = useCallback(async ({ id, Line1, Line2, city, state, country, Pincode }) => {
    const token = getStoredToken();
    return updateCustomerAddress({
      token,
      addressId: id,
      Line1,
      Line2,
      city,
      state,
      country,
      Pincode,
    });
  }, []);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (total, item) => total + Number(item.price ?? 0) * Number(item.quantity ?? 1),
      0,
    );
    const savings = cartItems.reduce(
      (total, item) =>
        total +
        (Number(item.oldPrice ?? item.price ?? 0) - Number(item.price ?? 0)) *
          Number(item.quantity ?? 1),
      0,
    );
    const shipping = cartItems.length > 0 && subtotal < 500 ? 70 : 0;

    return {
      subtotal,
      savings,
      shipping,
      finalTotal: subtotal + shipping,
    };
  }, [cartItems]);

  const placeOrder = async () => {
    const token = getStoredToken();
    if (!token || !cartId || !selectedSavedAddressId) {
      setIsPlacingOrder(false);
      return;
    }

    setOrderError("");
    setIsPlacingOrder(true);

    try {
      const payload = await createCustomerOrder({
        token,
        cartId,
        addressId: selectedSavedAddressId,
        shippingCharges: totals.shipping,
      });

      const total = Number(payload?.amount ?? payload?.total ?? totals.finalTotal) || totals.finalTotal;

      setPaymentData({
        key: payload.key,
        order_id: payload.order_id,
        amount: total,
        currency: payload.currency || "INR",
        booking_id: payload.booking_id,
      });
      setPaymentOpen(true);
    } catch (err) {
      setOrderError(err?.message || "Could not confirm order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleConfirmOrder = async () => {
    const userId = getStoredUserId();
    const token = getStoredToken();

    if (!userId || !token) {
      setAuthView("login");
      setAuthOpen(true);
      setOrderError("");
      return;
    }

    if (!cartItems.length) {
      setOrderError("Your cart is empty.");
      return;
    }

    if (!selectedSavedAddressId) {
      setOrderError("Please select a delivery address.");
      return;
    }
    if (!cartId) {
      setOrderError("Cart is still syncing. Please wait a moment and try again.");
      return;
    }

    setOrderError("");
    setIsPlacingOrder(true);

    try {
      const hasPhone = await userHasPhoneOnFile(token);
      if (!hasPhone) {
        setIsPlacingOrder(false);
        setPhoneModalOpen(true);
        return;
      }
      await placeOrder();
    } catch (err) {
      setIsPlacingOrder(false);
      setOrderError(err?.message || "Could not confirm order.");
    }
  };

  const handlePaymentSuccess = () => {
    setCartItems([]);
    setClientCartSnapshot([]);
    clearLegacyCartLocalStorage();
    setCartId("");
    window.dispatchEvent(new Event("divyaum-cart-updated"));

    setPaymentOpen(false);
    setPaymentData(null);

    router.push("/my-orders");
  };

  const handlePaymentFailure = async (msg) => {
    setPaymentOpen(false);
    setPaymentData(null);
    setOrderError(msg || "Payment was not completed. Please try again.");

    if (isServerCart()) {
      try {
        await refreshCartFromServer();
      } catch {
        // Cart items remain in local state as fallback
      }
    }
  };

  return (
    <>
      <section className={styles.cartSection} aria-label="Cart details">
        <div className="container">
          <div className={styles.cartGrid}>
            <section className={styles.itemsPanel}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionKicker}>Items in Cart</p>
                <h2 className={styles.sectionTitle}>Selected essentials</h2>
              </div>

              <div className={styles.itemsList}>
                {isLoadingCart ? (
                  <article className={styles.emptyCartCard}>
                    <h3 className={styles.emptyCartTitle}>Loading cart</h3>
                    <p className={styles.emptyCartText}>{loadingCartMessage}</p>
                  </article>
                ) : cartItems.length ? (
                  cartItems.map((item) => {
                    const itemKey = getItemKey(item);
                    const quantity = Number(item.quantity ?? 1);
                    const lineTotal = Number(item.price ?? 0) * quantity;
                    const oldLineTotal = Number(item.oldPrice ?? item.price ?? 0) * quantity;

                    return (
                      <article key={itemKey} className={styles.itemCard}>
                        <div className={styles.itemMedia}>
                          <Image src={item.image} alt={item.name} fill className={styles.itemImage} sizes="(max-width: 700px) 100vw, 180px" />
                        </div>

                        <div className={styles.itemMain}>
                          <p className={styles.itemName}>{item.name}</p>
                          <p className={styles.itemVariant}>{item.weight ?? "Standard pack"}</p>
                          <p className={styles.itemShortDesc}>{item.note ?? getDefaultNote(item)}</p>

                          <div className={styles.itemActions}>
                            <span className={styles.priceBlock}>
                              <strong>₹ {formatCurrency(lineTotal)}</strong>
                              {oldLineTotal > lineTotal ? <span>₹ {formatCurrency(oldLineTotal)}</span> : null}
                            </span>
                          </div>
                        </div>

                        <div className={styles.itemAside}>
                          <div
                            className={styles.quantityStepper}
                            role="group"
                            aria-label={`Quantity for ${item.name}`}
                          >
                            <span className={styles.quantityLabel}>Qty</span>
                            <button
                              type="button"
                              className={styles.quantityStepBtn}
                              aria-label={`Decrease quantity of ${item.name}`}
                              disabled={isSyncingCart || quantity <= 1}
                              onClick={() => handleStepQuantity(item, -1)}
                            >
                              −
                            </button>
                            <span className={styles.quantityValue} aria-live="polite">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              className={styles.quantityStepBtn}
                              aria-label={`Increase quantity of ${item.name}`}
                              disabled={isSyncingCart || quantity >= 99}
                              onClick={() => handleStepQuantity(item, 1)}
                            >
                              +
                            </button>
                          </div>
                          <Button
                            variant="unstyled"
                            type="button"
                            className={styles.deleteItemButton}
                            aria-label={`Remove ${item.name} from cart`}
                            disabled={isSyncingCart}
                            onClick={() => handleRemoveItem(item)}
                            title="Remove item"
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1Zm1 2v0h4V5h-4Zm-3 2v13h10V7H7Zm3 3a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Z" />
                            </svg>
                          </Button>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <article className={styles.emptyCartCard}>
                    <h3 className={styles.emptyCartTitle}>No items added yet</h3>
                    <p className={styles.emptyCartText}>
                      Tap Add to Cart on any product in Divya Store. Items are saved here even
                      before you sign in.
                    </p>
                    <Link className={styles.emptyCartButton} href="/divya-store">
                      Go to Divya Store
                    </Link>
                  </article>
                )}
              </div>
            </section>

            <aside id="summary" className={styles.summaryPanel}>
              <div className={styles.summaryCard}>
                <div className={styles.sectionHeader}>
                  <p className={styles.sectionKicker}>Order Summary</p>
                  <h2 className={styles.sectionTitle}>Checkout snapshot</h2>
                </div>

                <dl className={styles.summaryList}>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>₹ {formatCurrency(totals.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Shipping</dt>
                    <dd>₹ {formatCurrency(totals.shipping)}</dd>
                  </div>
                  <div>
                    <dt>Savings</dt>
                    <dd>-₹ {formatCurrency(totals.savings)}</dd>
                  </div>
                </dl>

                <div className={styles.totalRow}>
                  <span>Total</span>
                  <strong>₹ {formatCurrency(totals.finalTotal)}</strong>
                </div>

                {orderError ? <p className={styles.summaryError}>{orderError}</p> : null}

                <button
                  type="button"
                  className={styles.confirmOrderBtn}
                  disabled={isPlacingOrder || isLoadingCart || isSyncingCart || cartItems.length === 0}
                  onClick={() => void handleConfirmOrder()}
                >
                  {isPlacingOrder ? "Confirming…" : "Confirm order"}
                </button>
              </div>
            </aside>
          </div>

          <section className={styles.addressesBlock} aria-label="Saved delivery addresses">
            <div className={styles.addressesBlockHead}>
              <div>
                <p className={styles.sectionKicker}>Delivery</p>
                <h2 className={styles.sectionTitle}>Saved addresses</h2>
                {/* <p className={styles.addressesHint}>Same list as on your profile page.</p>
                <Link className={styles.manageAddressesLink} href="/profile/address">
                  Open address page
                </Link> */}
              </div>
              <div className={styles.addressesHeadActions}>
                <button
                  type="button"
                  className={styles.addAddressBtn}
                  onClick={openAddressAddModal}
                >
                  Add address
                </button>
              </div>
            </div>

            {addressesSectionError ? (
              <p className={styles.addressesAlert}>{addressesSectionError}</p>
            ) : null}

            {isLoadingSavedAddresses ? (
              <div className={styles.addressesEmpty}>Loading saved addresses…</div>
            ) : savedAddresses.length === 0 ? (
              <div className={styles.addressesEmpty}>
                No saved addresses yet. Use <strong>Add address</strong> above.
              </div>
            ) : (
              <div
                className={styles.addressesGrid}
                role="radiogroup"
                aria-label="Choose a delivery address"
              >
                {savedAddresses.map((row) => (
                  <AddressCard
                    key={row.id}
                    row={row}
                    radioName="cart-address-pick"
                    selected={selectedSavedAddressId === row.id}
                    onSelect={() => setSelectedSavedAddressId(row.id)}
                    onEdit={() => openAddressEditModal(row)}
                    onDelete={() => void handleRemoveSavedAddress(row.id)}
                    deleteDisabled={deletingAddressId === row.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <AddressAddModal
        open={addressModalOpen}
        editRecord={addressEditRecord}
        onClose={closeAddressModal}
        createAddress={createAddress}
        updateAddress={updateAddress}
        onSaved={(row) => {
          if (!row?.id) return;
          setAddressesSectionError("");
          setSavedAddresses((prev) => {
            const exists = prev.some((a) => a.id === row.id);
            if (exists) return prev.map((a) => (a.id === row.id ? row : a));
            return [...prev, row];
          });
        }}
        hint={
          addressEditRecord?.id
            ? "Update the fields and save. The card below will refresh."
            : "Put the city after the last comma (e.g. “12 MG Road, Indore , Indore”). You can use new lines before that comma for street and landmark. Pincode and state are required."
        }
      />

      <PhoneRequiredModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onSaved={() => {
          setPhoneModalOpen(false);
          void placeOrder();
        }}
      />

      <RazorpayCheckout
        open={paymentOpen}
        paymentData={paymentData}
        description="Divyaum Store Order"
        successHint="Your order has been placed successfully."
        successBtnLabel="View My Orders"
        referenceLabel="Order ID"
        prefill={(() => {
          try {
            const raw = typeof window !== "undefined" ? window.localStorage.getItem("user") : null;
            const user = raw ? JSON.parse(raw) : null;
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

      <AuthModal
        isOpen={authOpen}
        onClose={async () => {
          setAuthOpen(false);
          await hydrateCartFromServerIfLoggedIn();
          setCartItems(getClientCartSnapshot());
          if (isCartLoggedIn()) {
            try {
              await refreshCartFromServer();
            } catch (error) {
              console.error("Cart refresh after login failed:", error);
            }
          }
        }}
        defaultView={authView}
      />
    </>
  );
}
