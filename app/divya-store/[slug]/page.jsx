import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import StoreCardButton from "@/components/StoreProductCard/StoreCardButton";
import HeroCarousel from "@/components/Herocarousel/Herocarousel";

import styles from "./page.module.scss";
import { buildDetailShareMetadata } from "@/lib/detailMetadata";

export const dynamic = "force-dynamic";

/* ---------------- API ---------------- */

async function getProductBySlug(slug) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";
    const res = await fetch(
      `${baseUrl}/api/products/slug/${slug}`,
      { cache: "no-store" },
    );

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    return null;
  }
}

/* ---------------- Helpers ---------------- */

function formatNumber(value) {
  const num = Number(String(value ?? "").replaceAll(",", ""));
  if (Number.isFinite(num)) return num.toLocaleString("en-IN");
  return value;
}

function getSavings(price, mrp) {
  const p = Number(price);
  const m = Number(mrp);
  if (!p || !m || m <= p) return 0;
  return m - p;
}

function getOfferPercent(price, mrp) {
  const p = Number(price);
  const m = Number(mrp);
  if (!p || !m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
}

/* ---------------- Metadata ---------------- */

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Divya Store",
      description: "Product not found",
    };
  }

  return buildDetailShareMetadata({
    title: `${product.name} | Divya Store`,
    description: product.shortDescription || product.description,
    image: [
      product.image,
      // product.mainImage,
      // product.otherImages,
      // product.images,
    ],
    path: `/divya-store/${slug}`,
  });
}

/* ---------------- Page ---------------- */

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const price = Number(product.discountPrice ?? product.mrp ?? 0);
  const mrp = Number(product.mrp ?? 0);
  const isSold = product.isAvailable === false;

  const savings = getSavings(price, mrp);
  const offerPercent = getOfferPercent(price, mrp);

  const cartItem = {
    productId: product._id || product.id,
    name: product.name,
    slug: product.slug,
    description: product.shortDescription,
    image: product.image,
    price,
    oldPrice: mrp,
    weight: product.weight || "",
    quantity: 1,
  };

  const images = (Array.isArray(product.otherImages) && product.otherImages.length)
    ? product.otherImages
    : (Array.isArray(product.images) && product.images.length)
      ? product.images
      : [product.image];

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className="container">

            {/* Breadcrumb */}
            <nav className={styles.breadcrumb}>
              <Link href="/divya-store">Divya Store</Link>
              <span>/</span>
              <span>{product.name}</span>
            </nav>

            {/* Layout */}
            <div className={styles.detailLayout}>

              {/* IMAGE */}
              {/* IMAGE */}
              <div className={styles.imagePanel}>
                <div className={styles.imageWrap}>
                  <HeroCarousel
                    images={images.filter(Boolean)}
                    alt={product.name}
                    className={styles.productCarousel}
                  />
                </div>
              </div>

              {/* INFO */}
              <div className={styles.infoPanel}>
                <p className={styles.categoryTag}>Divya Store</p>

                <h1 className={styles.title}>{product.name}</h1>

                <p className={styles.description}>
                  {product.shortDescription}
                </p>

                <div className={styles.priceBand}>
                  <span className={styles.price}>
                    ₹ {formatNumber(price)}
                  </span>

                  {mrp > price && (
                    <span className={styles.oldPrice}>
                      ₹ {formatNumber(mrp)}
                    </span>
                  )}

                  {offerPercent > 0 && (
                    <span className={styles.offer}>
                      {offerPercent}% OFF
                    </span>
                  )}
                </div>

                {savings > 0 && (
                  <p className={styles.savings}>
                    You save ₹ {formatNumber(savings)}
                  </p>
                )}

                {product.weight && (
                  <p className={styles.weight}>
                    Pack Size: {product.weight}
                  </p>
                )}

                {/* CTA */}
                <div className={styles.ctaRow}>
                  {isSold ? (
                    <span className={styles.soldStatus} role="status">
                      Sold
                    </span>
                  ) : (
                    <>
                      <StoreCardButton
                        label="Add to Cart"
                        cartItem={cartItem}
                      />

                      <Link href="/cart" className={styles.secondaryCta}>
                        Go to Cart
                      </Link>
                    </>
                  )}
                </div>

                {/* DESCRIPTION */}
                <div className={styles.fullDescription}>
                  <p>{product.description}</p>
                </div>

                {/* BENEFITS (NO mapping of categoryIds/poojaIds) */}
                {product.benefits?.length ? (
                  <ul className={styles.highlights}>
                    {product.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}