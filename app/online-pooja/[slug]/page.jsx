import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Button from "@/components/Button";
import styles from "./page.module.scss";
import AvailabilitySection from "./AvailabilitySection";
import PackagesSelector from "@/components/PackagesSelector/PackagesSelector";
import HeroCarousel from "@/components/Herocarousel/Herocarousel";
import StoreProductCard from "@/components/StoreProductCard/StoreProductCard";
import ProductCarousel from "@/components/ProductCarousel/ProductCarousel";
import { buildDetailShareMetadata } from "@/lib/detailMetadata";

function normalizeProduct(p) {
  return {
    id: p._id || p.id,
    _id: p._id || p.id,
    name: p.name || p.productName || "",
    slug: p.slug || p._id || p.id,
    image: p.image || p.thumbnail || "",
    price: p.discountPrice || p.price || 0,
    oldPrice: p.mrp || p.originalPrice || p.price || 0,
    rating: p.averageRating || p.rating || 0,
    reviews: p.totalRatings || p.reviews || 0,
    shortDescription: p.shortDescription || p.description || "",
    description: p.shortDescription || p.description || "",
    isAvailable: p.isAvailable !== false,
  };
}

export const dynamic = "force-dynamic";

function mapApiToDetail(apiPooja, slots,relatedProducts) {
  const temple = apiPooja?.temple ?? {};
  const templeName = temple?.name || apiPooja?.templeName || "Temple";
  const templeLocation = temple?.address || apiPooja?.location || "Ujjain, India";
  const templeImage = temple?.image;
  const featuredImage = apiPooja?.featuredImage;
  // Prefer featured image (same as listing cards), then gallery
  const carouselImages = [
    ...(Array.isArray(apiPooja?.images) ? apiPooja.images : []),
  ].filter(Boolean);

  const shortDescription = apiPooja?.shortDescription || apiPooja?.description || "";
  const about = apiPooja?.description || shortDescription;
  const highlightSource = about ? about.split(".").filter(Boolean).slice(0, 2) : [];
  const benefits = Array.isArray(apiPooja?.benefits)
    ? apiPooja.benefits.map((benefit, index) => ({
        icon: ["🔱", "✨", "🕉️", "🌸", "🙏", "🌟"][index % 6],
        title: benefit?.name || `Benefit ${index + 1}`,
        desc: benefit?.description || "",
      }))
    : [];

  return {
    id: apiPooja?._id ?? "",
    slug: apiPooja?.slug ?? "",
    title: apiPooja?.name ?? "Pooja",
    shortDescription,
    about,
    featuredImage,
    carouselImages,
    pandit: {
      name: apiPooja?.priest?.name ?? "Pandit Ji",
      image: apiPooja?.priest?.image || "",
      experience: apiPooja?.priest?.experience ? `${apiPooja.priest.experience}+ yrs` : "10+ yrs",
      
    },
    slots: slots ?? [],
    durationMins: apiPooja?.duration || null,
    // location: templeLocation,
    // where: templeLocation,
    highlights: Array.isArray(apiPooja?.highlights) && apiPooja.highlights.length
      ? apiPooja.highlights
      : highlightSource,
    steps: apiPooja?.steps || [
      "Select package",
      "Choose slot",
      "Fill details",
      "Get Pooja Meeting Link",
      "Aarti & prasad delivery",
    ],
    packages: apiPooja?.packages || [],
    gallery: carouselImages,
    benefits,
    templeImage,
    templeName,
    templeLocation,
    templeDesc: temple?.description || "",
    relatedProducts: relatedProducts.map(normalizeProduct),
  };
}

async function fetchPoojaBySlug(slug) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000";

  try {
    const res = await fetch(
      `${baseUrl}/api/poojas/slug/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return mapApiToDetail(json?.pooja, json?.slots ?? [], json?.relatedProducts ?? []);
  } catch (err) {
    console.error("[fetchPoojaBySlug] exception:", err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pooja = await fetchPoojaBySlug(slug);
  if (!pooja) return { title: "Pooja Details | Divyaum" };

  return buildDetailShareMetadata({
    title: `${pooja.title} | Divyaum`,
    description: pooja.shortDescription || pooja.about,
    image: [
      pooja.featuredImage,
      pooja.carouselImages,
      pooja.templeImage,
      pooja.gallery,
    ],
    path: `/online-pooja/${slug}`,
  });
}

async function PoojaDetailPageServer({ params }) {
  const { slug } = await params;
  console.log("[PoojaDetailPage] rendering slug:", slug);

  const pooja = await fetchPoojaBySlug(slug);
  if (!pooja) notFound();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero} aria-label={`${pooja.title} details`}>
          <div className="container">

            {/* Hero Grid */}
            <div className={styles.heroGrid}>
              <div className={styles.heroMedia}>
                <HeroCarousel images={pooja.carouselImages} alt={pooja.title} />
              </div>

              <div className={styles.heroContent}>
                <h1 className={styles.title}>{pooja.title}</h1>
                {pooja.shortDescription && (
                  <p className={styles.shortDescription}>{pooja.shortDescription}</p>
                )}

                {/* ✅ Single card — list style */}
                {/* <div className={styles.infoCard}> */}
                  <ul className={styles.infoListPlain}>

                    <li className={styles.infoItem}>
                      <span className={styles.infoIconWrap}>
                        <svg viewBox="0 0 24 24" className={styles.infoIcon}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </span>
                      <div>
                        <span className={styles.infoListLabel}>Location</span>
                        <span className={styles.infoListValue}>{pooja.templeLocation}</span>
                      </div>
                    </li>

                    <li className={styles.infoItemDivider} />

                    <li className={styles.infoItem}>
                      <span className={styles.infoIconWrap}>
                        <svg viewBox="0 0 24 24" className={styles.infoIcon}>
                          <circle cx="12" cy="8" r="4"/>
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                      </span>
                      <div>
                        <span className={styles.infoListLabel}>Pandit Ji</span>
                        <span className={styles.infoListValue}>{pooja.pandit.name}</span>
                        <span className={styles.infoListSub}>{pooja.pandit.experience}</span>
                        {/* <span className={styles.infoListSub}>{pooja.pandit.specialty}</span> */}
                      </div>
                    </li>

                    <li className={styles.infoItemDivider} />

                    <li className={styles.infoItem}>
                      <span className={styles.infoIconWrap}>
                        <svg viewBox="0 0 24 24" className={styles.infoIcon}>
                          <circle cx="12" cy="12" r="9"/>
                          <path d="M12 7v5l3 3"/>
                        </svg>
                      </span>
                      <div>
                        <span className={styles.infoListLabel}>Duration</span>
                        <span className={styles.infoListValue}>{pooja.durationMins ? `${pooja.durationMins} Mins` : "N/A"}</span>
                      </div>
                    </li>

                  </ul>
                {/* </div> */}

                <Button
                  as="a"
                  variant="unstyled"
                  type="button"
                  className={styles.bookButton}
                  href="#packages"
                >
                  Book Now{" "}
                  <span className={styles.ctaArrow} aria-hidden="true">›</span>
                </Button>
              </div>
            </div>

            {/* About */}
            {pooja.about && (
              <section className={styles.aboutSection} aria-label="About this pooja">
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>About {pooja.title}</h2>
                </div>
                <p className={styles.aboutText}>{pooja.about}</p>
              </section>
            )}

            {/* Benefits */}
            {pooja.benefits && pooja.benefits.length > 0 && (
              <section className={styles.benefitsSection} aria-label={`Benefits of ${pooja.title}`}>
                <div className={styles.benefitsHeader}>
                  <h2 className={styles.benefitsTitle}>Benefits of {pooja.title}</h2>
                  <p className={styles.benefitsSubtitle}>
                    Experience the divine grace and transformation this sacred ritual brings to your life.
                  </p>
                </div>
                <div className={styles.benefitsGrid}>
                  {pooja.benefits.map((b, i) => (
                    <div className={styles.benefitCard} key={b.title + i}>
                      {/* <div className={styles.benefitIcon}>{b.icon}</div> */}
                      <div>
                        <div className={styles.benefitTitle}>{b.title}</div>
                        <div className={styles.benefitDesc}>{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Temple */}
            {(pooja.templeImage || pooja.templeDesc) && (
              <section className={styles.templeSection} aria-label="Temple details">
                <div className={styles.sectionHeader}>
                  <p className={styles.kicker}>Temple</p>
                  <h2 className={styles.sectionTitle}>Temple Details</h2>
                </div>
                <div className={styles.templeGrid}>
                  {pooja.templeImage ? (
                    <div className={styles.templeImageCard}>
                      <Image
                        src={pooja.templeImage}
                        alt={`${pooja.title} temple`}
                        fill
                        className={`${styles.templeImage} ${styles.templeImageDesktop}`}
                        sizes="(max-width: 900px) 100vw, 340px"
                      />
                      <Image
                        src={pooja.templeImage}
                        alt={`${pooja.title} temple`}
                        width={800}
                        height={600}
                        className={`${styles.templeImage} ${styles.templeImageMobile}`}
                        sizes="100vw"
                      />
                    </div>
                  ) : null}
                  <div className={styles.templeDetailsCard}>
                    <div className={styles.templeDetailsHeader}>
                      {/* <span className={styles.templeIcon}>🏛️</span> */}
                      <span className={styles.panelKicker}>Temple Details</span>
                    </div>
                    <h3 className={styles.templeName}>
                      {pooja.templeName || "Temple"}
                    </h3>
                    <div className={styles.templeDetailsMeta}>
                      <div>
                        <strong>Location:</strong>
                        <span className={styles.templeMetaValue}>
                          {pooja.templeLocation}
                        </span>
                      </div>
                    </div>
                    <p className={styles.templeDesc}>{pooja.templeDesc}</p>
                  </div>
                </div>
              </section>
            )}

          </div>
        </section>

        {/* Process */}
        <section className={styles.processSection} aria-label="How the pooja happens">
          <div className={styles.panelHeader}>
            <p className={styles.panelKicker}>Process</p>
            <h2 className={styles.panelTitle}>How It Happens</h2>
          </div>
          <div className={styles.processTrack}>
            {pooja.steps.map((step, i) => (
              <div key={i} className={styles.processStep}>
                <div className={styles.processIconRing}>
                  <span className={styles.processNum}>{i + 1}</span>
                  <svg viewBox="0 0 24 24" className={styles.processIcon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {i === 0 && <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}
                    {i === 1 && <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>}
                    {i === 2 && <><rect x="2" y="2" width="16" height="20" rx="2"/><circle cx="10" cy="8" r="3"/><path d="M5.5 14c1.5-2 7.5-2 9 0"/></>}
                    {i === 3 && <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>}
                    {i === 4 && <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}
                  </svg>
                </div>
                <p className={styles.processText}>{step}</p>
                {i < pooja.steps.length - 1 && (
                  <span className={styles.processArrow}>›</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section className={styles.packagesSection} id="packages" aria-label="Pooja packages">
          <div className="container">
            <div className={styles.sectionHeader}>
              <p className={styles.kicker}>Packages</p>
              <h2 className={styles.sectionTitle}>Choose Your Pooja Package</h2>
            </div>
            <PackagesSelector />
          </div>
        </section>

        {/* Availability */}
        {pooja.slots.length > 0 ? (
          <AvailabilitySection
            poojaId={pooja.id}
            availability={pooja.slots}
            pooja={{ title: pooja.title }}
          />
        ) : (
            <div className={styles.noSlotsMessage}>
              <p>All pooja slots for this month have been booked. New slots will open soon.</p>
            </div>
        )}

         {/* Gallery */}
        {/* <section className={styles.gallerySection} aria-label="Related pooja images">
          <div className="container">
            <h2 className={styles.galleryTitle}>Related Images</h2>
            <div className={styles.gallery}>
              {pooja.gallery.map((imageSrc, index) => (
                <div key={`${pooja.slug}-${index}`} className={styles.thumbWrap}>
                  <Image
                    src={imageSrc}
                    alt={`${pooja.title} image ${index + 1}`}
                    fill
                    className={styles.thumbImage}
                    sizes="(max-width: 700px) 50vw, 280px"
                  />
                </div>
              ))}
            </div>
          </div>
        </section> */}

        <ProductCarousel products={pooja.relatedProducts} />

      </main>

      <Footer />
    </div>
  );
}

export default PoojaDetailPageServer;