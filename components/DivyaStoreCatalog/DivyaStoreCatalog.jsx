"use client";

import { useMemo, useState, useEffect } from "react";
import StoreProductCard from "@/components/StoreProductCard/StoreProductCard";
import CartSuccessPopup from "@/components/StoreProductCard/CartSuccessPopup";
import Button from "@/components/Button";
import styles from "./DivyaStoreCatalog.module.scss";

function normalizeProduct(p, fallbackCategoryName = "") {
  const id = p._id || p.id || "";
  const categoryIds = Array.isArray(p.categoryIds)
    ? p.categoryIds.map((c) => c?._id || c?.id || c || "")
    : [];
  const primaryCat = categoryIds[0] || "store";
  return {
    id,
    slug: p.slug || "",
    name: p.name || "",
    image: p.image || p.mainImage || "",
    price: String(p.discountPrice ?? p.price ?? ""),
    oldPrice: String(p.mrp ?? p.oldPrice ?? ""),
    description: p.shortDescription || p.description || "",
    weight: p.weight || p.packSize || "",
    rating: Number(p.averageRating ?? p.rating ?? 4.2),
    reviews: p.totalRatings ?? p.reviews ?? 0,
    offerLabel: p.offerLabel || "",
    categoryName:
      (Array.isArray(p.categoryIds) && p.categoryIds[0]?.name) ||
      fallbackCategoryName,
    isAvailable: p.isAvailable !== false,
  };
}

export default function DivyaStoreCatalog({ categories = [] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCartPopup, setShowCartPopup] = useState(false);

  const handleCartSuccess = () => {
    setShowCartPopup(true);
    setTimeout(() => setShowCartPopup(false), 2000);
  };

  // ✅ API call — "all" pe without categoryId, category pe with categoryId
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setProducts([]);

    async function load() {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:4000";
        const url =
          activeCategory === "all"
            ? `${baseUrl}/api/products`
            : `${baseUrl}/api/products?categoryId=${activeCategory}`;

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`status:${res.status}`);
        const json = await res.json();
        if (!mounted) return;

        const raw = Array.isArray(json) ? json : (json?.data ?? json?.products ?? []);
        setProducts(raw.map((p) => normalizeProduct(p)));
      } catch (err) {
        console.error("Products fetch error:", err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [activeCategory]);

  const navCategories = useMemo(
    () =>
      categories.map((c) => ({
        id: c._id || c.id || c.slug || c.name,
        name: c.name,
        image: c.image,
      })),
    [categories]
  );

  return (
    <div className={styles.wrapper}>

      {/* ── Category Nav ── */}
      <div className={styles.categoryNav}>
        <Button
          variant="unstyled"
          type="button"
          className={`${styles.categoryChip} ${activeCategory === "all" ? styles.active : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          <div className={styles.categoryChipContent}>
            <span className={styles.categoryChipLabel}>All</span>
          </div>
        </Button>

        {navCategories.map((cat) => (
          <Button
            variant="unstyled"
            key={cat.id}
            type="button"
            className={`${styles.categoryChip} ${activeCategory === cat.id ? styles.active : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <div className={styles.categoryChipContent}>
              <span className={styles.categoryChipLabel}>{cat.name}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* ── Products Grid ── */}
      <div className={styles.categoriesList}>
        <section className={styles.categoryBlock}>

          {loading && (
            <div className={styles.productsGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} aria-hidden="true" />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className={styles.emptyState}>
              <p>No products found.</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className={styles.productsGrid}>
              {products.map((product, index) => (
                <StoreProductCard
                  key={`${product.id}-${index}`}
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
                  onAddToCartSuccess={handleCartSuccess}
                />
              ))}
            </div>
          )}

        </section>
      </div>

      {showCartPopup && <CartSuccessPopup onClose={() => setShowCartPopup(false)} />}
    </div>
  );
}