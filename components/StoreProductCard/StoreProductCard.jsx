"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import OfferBadge from "@/components/OfferBadge/OfferBadge";
import StoreCardButton from "./StoreCardButton";
import styles from "./StoreProductCard.module.scss";

function formatNumber(value) {
  const normalized = Number(String(value ?? "").replaceAll(",", ""));

  if (Number.isFinite(normalized)) {
    return normalized.toLocaleString("en-IN");
  }

  return value;
}

function renderStars(rating) {
  const numericRating = Number(rating);

  const clamped = Number.isFinite(numericRating)
    ? Math.max(0, Math.min(5, numericRating))
    : 0;

  const fullStars = Math.round(clamped);

  return Array.from({ length: 5 }, (_, idx) => (
    <span
      key={`${idx}-${fullStars}`}
      className={idx < fullStars ? styles.starActive : styles.star}
    >
      {"\u2605"}
    </span>
  ));
}

export default function StoreProductCard({
  productId,
  slug,
  name,
  image,
  price,
  oldPrice,
  weight,
  description,
  categoryName,
  rating = 4,
  reviews = "2,345",
  offerLabel,
  detailHref,
  ctaLabel = "Add to Cart",
  isAvailable = true,
  onAddToCartSuccess,
}) {
  const router = useRouter();
  const isSold = isAvailable === false;

  const targetHref =
    detailHref || (slug ? `/divya-store/${slug}` : "");

  const handleCardClick = () => {
    if (!targetHref) return;
    router.push(targetHref);
  };

  const handleCardKeyDown = (event) => {
    if (!targetHref) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(targetHref);
    }
  };

  const displayTitle = weight
    ? `${weight} ${name}`
    : name;

  /* ---------------- PRICE ---------------- */

  const currentPrice = Number(
    String(price ?? "").replaceAll(",", "")
  );

  const originalPrice = Number(
    String(oldPrice ?? "").replaceAll(",", "")
  );

  /* ---------------- AUTO OFFER ---------------- */

  const computedOffer =
    originalPrice > currentPrice
      ? `${Math.round(
          ((originalPrice - currentPrice) / originalPrice) * 100
        )}% OFF`
      : offerLabel;

  /* ---------------- CART ITEM ---------------- */

  const cartItem = {
    productId: productId || slug,
    name,
    slug,
    description,
    categoryName,
    image,
    price: currentPrice,
    oldPrice: originalPrice || currentPrice,
    weight,
    offerLabel: computedOffer,
    quantity: 1,
  };

  return (
    <article
      className={styles.card}
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`View details for ${name}`}
    >
      {/* IMAGE */}
      <div className={styles.media}>
        {computedOffer ? (
          <OfferBadge label={computedOffer} />
        ) : null}

        {isSold ? (
          <span className={styles.soldBadge} aria-label="Sold">
            Sold
          </span>
        ) : null}

        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className={styles.image}
            sizes="(max-width: 620px) 92vw, (max-width: 1024px) 46vw, 31vw"
          />
        ) : null}
      </div>

      {/* BODY */}
      <div className={styles.body}>
        {/* PRICE + RATING */}
        <div
          className={styles.priceRow}
          aria-label="Pricing and reviews"
        >
          <div className={styles.priceWrap}>
            <span className={styles.price}>
              ₹ {formatNumber(price)}
            </span>

            {oldPrice ? (
              <span className={styles.oldPrice}>
                ₹ {formatNumber(oldPrice)}
              </span>
            ) : null}
          </div>

          {rating ? (
            <div
              className={styles.ratingWrap}
              aria-label={`${rating} out of 5 stars`}
            >
              <span className={styles.stars}>
                {renderStars(rating)}
              </span>

              {reviews ? (
                <span className={styles.reviewCount}>
                  {formatNumber(reviews)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TITLE */}
        <h3 className={styles.name}>
          {displayTitle}
        </h3>

        {/* CTA */}
        <div className={styles.ctaRow}>
          {isSold ? (
            <span className={styles.soldStatus} role="status">
              Sold
            </span>
          ) : (
            <StoreCardButton
              label={ctaLabel}
              cartItem={cartItem}
              onAddToCartSuccess={onAddToCartSuccess}
            />
          )}
        </div>
      </div>
    </article>
  );
}