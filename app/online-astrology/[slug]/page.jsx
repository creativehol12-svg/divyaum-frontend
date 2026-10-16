import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import AstrologySlotBooking from "@/components/AstrologySlotBooking/AstrologySlotBooking";
import ConsultationPlans from "@/components/ConsultationPlans/ConsultationPlans";
import Button from "@/components/Button";
import styles from "./page.module.scss";
import { buildDetailShareMetadata } from "@/lib/detailMetadata";

export const dynamic = "force-dynamic";

function formatNumber(value) {
  return Number(value).toLocaleString("en-IN");
}

function mapAstrologerToDetailItem(apiAstrologer, slug) {
  const selectedFee =
    apiAstrologer?.fees?.find((item) => item.minutes === 15);

  const price = selectedFee?.fee || 0;
  const oldPrice = price ? Math.round(price * 1.35) : 0;
  const durationMins = selectedFee?.minutes || 15;
  const features = Array.isArray(apiAstrologer?.features) ? apiAstrologer.features : [];
  const image = apiAstrologer?.image || "";

  return {
    id: apiAstrologer?._id ?? apiAstrologer?.id ?? "",
    slug: apiAstrologer?.slug ?? String(slug ?? ""),
    title: apiAstrologer?.name ?? "Astrologer",
    about: apiAstrologer?.description ?? apiAstrologer?.bio ?? "",
    image,
    price: formatNumber(price || 0),
    oldPrice: formatNumber(oldPrice || price || 0),
    duration: `${durationMins} Mins`,
    highlights: features.length ? features : [],
    fees: apiAstrologer?.fees || [],
    gallery: [image].filter(Boolean),
  };
}

async function fetchAstrologerBySlug(slug) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const response = await fetch(
    `${baseUrl}/api/astrologers/slug/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (!response.ok) return null;

  const json = await response.json();
  if (!json) return null;
  return json?.data ?? json;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const apiAstrologer = await fetchAstrologerBySlug(slug);
  const item = apiAstrologer ? mapAstrologerToDetailItem(apiAstrologer, slug) : null;

  if (!item) {
    return { title: "Consultation Details | Divyaum" };
  }

  return buildDetailShareMetadata({
    title: `${item.title} | Divyaum`,
    description: item.about,
    image: [apiAstrologer?.image, item.image, item.gallery],
    path: `/online-astrology/${slug}`,
  });
}

export default async function AstrologyDetailPage({ params }) {
  const { slug } = await params;
  const apiAstrologer = await fetchAstrologerBySlug(slug);
  const item = apiAstrologer ? mapAstrologerToDetailItem(apiAstrologer, slug) : null;

  if (!item) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero} aria-label={`${item.title} details`}>
          <div className="container">
            <div className={styles.heroGrid}>
              <div className={styles.heroMedia}>
                {item.image ? (
                  <>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      priority
                      className={`${styles.heroImage} ${styles.heroImageDesktop}`}
                      sizes="(max-width: 980px) 100vw, 50vw"
                    />
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={800}
                      height={1000}
                      priority
                      className={`${styles.heroImage} ${styles.heroImageMobile}`}
                      sizes="100vw"
                    />
                  </>
                ) : null}
              </div>

              <div className={styles.heroContent}>
                <p className={styles.kicker}>Consultation</p>
                <h1 className={styles.title}>{item.title}</h1>
                <p className={styles.text}>{item.about}</p>

                <div className={styles.metaRow}>
                  <div className={styles.priceWrap}>
                    <span className={styles.price}>₹ {item.price}</span>
                  </div>
                  {item.duration ? <span className={styles.duration}>{item.duration}</span> : null}
                </div>

                <ul className={styles.points} aria-label="Highlights">
                  {item.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>

                <Button as="a" variant="unstyled" className={styles.bookButton} href="#slots">
                  Book Now <span className={styles.ctaArrow} aria-hidden="true">›</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <ConsultationPlans
          fees={item.fees}
          fallbackBaseFee={
            item.fees?.length
              ? undefined
              : Number(String(item.price ?? "0").replace(/,/g, "")) || undefined
          }
        />

        <AstrologySlotBooking
          serviceTitle={item.title}
          astrologerId={item.id}
          price={item.price}
          duration={item.duration}
          fees={item.fees}
        />
      </main>

      <Footer />
    </div>
  );
}
