"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import StoreProductCard from "@/components/StoreProductCard/StoreProductCard";
import styles from "./ProductCarousel.module.scss";

function getVisibleCount(width) {
  if (width <= 640) return 1;
  if (width <= 1024) return 2;
  return 3;
}

function useVisibleCardCount() {
  const [visibleCards, setVisibleCards] = useState(1);

  useLayoutEffect(() => {
    const update = () => setVisibleCards(getVisibleCount(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return visibleCards;
}

export default function ProductCarousel({
  products = [],
  showHeader = true,
  title = "Related Products",
  embedded = false,
  enableSwipe = false,
  className = "",
}) {
  const [index, setIndex] = useState(0);
  const visibleCards = useVisibleCardCount();
  const touchStartX = useRef(null);

  const maxIndex = Math.max(0, products.length - visibleCards);
  const canSlide = products.length > visibleCards;

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  const next = useCallback(() => {
    setIndex((current) => Math.min(current + 1, maxIndex));
  }, [maxIndex]);

  const onTouchStart = (event) => {
    if (!enableSwipe) return;
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (!enableSwipe || touchStartX.current == null) return;

    const delta = touchStartX.current - event.changedTouches[0].clientX;
    touchStartX.current = null;

    if (delta > 48) next();
    else if (delta < -48) prev();
  };

  if (!products || products.length === 0) return null;

  const wrapClass = [
    styles.carouselWrap,
    embedded ? styles.embedded : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapClass}>
      {(showHeader || canSlide) && (
        <div className={styles.header}>
          {showHeader ? (
            <h3 className={styles.title}>
              {title} {products.length}
            </h3>
          ) : (
            <span className={styles.headerSpacer} aria-hidden="true" />
          )}

          {canSlide ? (
            <div className={styles.controls}>
              <button
                type="button"
                onClick={prev}
                disabled={index === 0}
                aria-label="Previous products"
                className={styles.ctrl}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={next}
                disabled={index === maxIndex}
                aria-label="Next products"
                className={styles.ctrl}
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      )}

      <div
        className={styles.viewport}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={styles.trackSlider}
          style={{
            "--slide-count": products.length,
            "--visible-count": visibleCards,
            transform: `translateX(calc(-100% * ${index} / ${products.length}))`,
          }}
        >
          {products.map((product, i) => (
            <div
              key={product._id || product.id || i}
              className={styles.slide}
            >
              <StoreProductCard
                productId={product._id || product.id}
                name={product.name}
                slug={product.slug}
                image={product.image}
                price={product.discountPrice ?? product.price}
                oldPrice={product.mrp ?? product.oldPrice}
                rating={
                  product.rating ??
                  (product.averageRating > 0 ? product.averageRating : null)
                }
                reviews={product.reviews ?? product.totalRatings}
                description={
                  product.shortDescription || product.description || ""
                }
                isAvailable={product.isAvailable !== false}
                detailHref={product.slug ? `/divya-store/${product.slug}` : ""}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

