"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./StoreProductCard.module.scss";
import {
  addOrUpdateCartItem,
  getCartQuantityForProductId,
  hydrateCartFromServerIfLoggedIn,
  updateCartLineQuantity,
} from "./cartApi";
import CartSuccessPopup from "./CartSuccessPopup";

function getProductKey(cartItem) {
  return String(cartItem?.productId || cartItem?.slug || "");
}

export default function StoreCardButton({ label = "Add to Cart", cartItem, onAddToCartSuccess }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [qtyInCart, setQtyInCart] = useState(0);

  const productKey = getProductKey(cartItem);

  const readQtyFromSnapshot = useCallback(() => {
    if (!productKey) return 0;
    return getCartQuantityForProductId(productKey);
  }, [productKey]);

  useEffect(() => {
    setQtyInCart(readQtyFromSnapshot());
  }, [readQtyFromSnapshot]);

  useEffect(() => {
    const sync = () => setQtyInCart(readQtyFromSnapshot());
    window.addEventListener("divyaum-cart-updated", sync);
    return () => {
      window.removeEventListener("divyaum-cart-updated", sync);
    };
  }, [readQtyFromSnapshot]);

  useEffect(() => {
    void hydrateCartFromServerIfLoggedIn();
  }, []);

  const handleAddToCart = async (event) => {
    event.stopPropagation();
    if (!cartItem) return;

    setIsAdding(true);
    try {
      await addOrUpdateCartItem({
        ...cartItem,
        qty: cartItem.quantity ?? 1,
      });
      setShowPopup(true);
      if (typeof onAddToCartSuccess === "function") {
        onAddToCartSuccess();
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const applyQty = async (nextQty) => {
    if (!cartItem || !productKey) return;

    setIsSyncing(true);
    try {
      await updateCartLineQuantity(cartItem, nextQty);
    } catch (error) {
      console.error("Cart quantity update failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStep = async (event, delta) => {
    event.stopPropagation();
    if (!cartItem || !productKey || isSyncing) return;

    const current = Number(qtyInCart || 0);
    const next = Math.max(0, Math.min(99, current + delta));
    if (next === current) return;

    await applyQty(next);
  };

  const handleClosePopup = () => setShowPopup(false);

  return (
    <>
      {productKey && qtyInCart > 0 ? (
        <div
          className={styles.cardCartRow}
          role="group"
          aria-label="Quantity in cart"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className={styles.cardCartStepper}>
            <span className={styles.cardCartQtyLabel}>Qty</span>
            <button
              type="button"
              className={styles.cardCartStepBtn}
              aria-label="Decrease quantity"
              disabled={isSyncing}
              onClick={(e) => handleStep(e, -1)}
            >
              −
            </button>
            <span className={styles.cardCartQtyValue} aria-live="polite">
              {qtyInCart}
            </span>
            <button
              type="button"
              className={styles.cardCartStepBtn}
              aria-label="Increase quantity"
              disabled={isSyncing || qtyInCart >= 99}
              onClick={(e) => handleStep(e, 1)}
            >
              +
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.cta}
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? "Adding..." : label}
          <span className={styles.ctaArrow} aria-hidden="true">
            ›
          </span>
        </button>
      )}
      {showPopup ? <CartSuccessPopup onClose={handleClosePopup} /> : null}
    </>
  );
}
