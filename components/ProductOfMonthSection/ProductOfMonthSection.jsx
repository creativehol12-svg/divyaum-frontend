"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import StoreProductCard from "@/components/StoreProductCard/StoreProductCard";
import ProductCarousel from "@/components/ProductCarousel/ProductCarousel";
import Button from "@/components/Button";
import { fetchFeaturedProducts } from "@/lib/productsApi";
import styles from "./ProductOfMonthSection.module.scss";

const CAROUSEL_THRESHOLD = 1;
const SKELETON_COUNT = 3;

function ProductCardItem({ product }) {
  return (
    <StoreProductCard
      productId={product.id}
      name={product.name}
      slug={product.slug}
      image={product.image}
      price={product.price}
      oldPrice={product.oldPrice}
      weight={product.weight}
      rating={product.rating}
      reviews={product.reviews}
      offerLabel={product.offerLabel}
      description={product.description}
      categoryName={product.categoryName}
      isAvailable={product.isAvailable}
      detailHref={product.slug ? `/divya-store/${product.slug}` : ""}
    />
  );
}

export default function ProductOfMonthSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchFeaturedProducts();
    setProducts(result.products);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const useCarousel = products.length > CAROUSEL_THRESHOLD;

  return (
    <section
      className={styles.section}
      aria-labelledby="product-of-month-heading"
    >
      <div className="container">
        <header className={styles.header}>
          <p className={styles.subtitle}>Curated For You</p>
          <h2 id="product-of-month-heading" className={styles.title}>
            Products of the Month
          </h2>
          <p className={styles.description}>
            Handpicked spiritual essentials from Divya Store — crafted for devotion
            and everyday rituals.
          </p>
        </header>

        {loading ? (
          <div
            className={styles.skeletonGrid}
            aria-busy="true"
            aria-label="Loading featured products"
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div key={index} className={styles.skeletonCard} aria-hidden="true" />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateText}>{error}</p>
            <Button
              type="button"
              variant="unstyled"
              className={styles.retryButton}
              onClick={loadProducts}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <div className={styles.stateBox}>
            <p className={styles.stateText}>
              No featured products are available right now. Check back soon.
            </p>
            <Button
              as={Link}
              variant="unstyled"
              className={styles.retryButton}
              href="/divya-store"
            >
              Browse Divya Store
            </Button>
          </div>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className={styles.productsArea}>
            {useCarousel ? (
              <ProductCarousel
                products={products}
                showHeader={false}
                embedded
                enableSwipe
              />
            ) : (
              <div className={styles.grid} role="list">
                {products.map((product) => (
                  <div key={product.id} role="listitem" className={styles.gridItem}>
                    <ProductCardItem product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
