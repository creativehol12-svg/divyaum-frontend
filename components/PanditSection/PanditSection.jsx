import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import styles from "./PanditSection.module.scss";
import OfferBadge from "../OfferBadge/OfferBadge";

function mapApiPanditToCard(apiPandit) {
  const slug = apiPandit?.slug ?? "";
  const price = apiPandit?.fees?.find((item) => item.minutes === 15)?.fee || 0;
  const oldPrice = price ? Math.round(price * 1.35) : 0;
  const features = Array.isArray(apiPandit?.features) ? apiPandit.features : [];

  return {
    slug,
    title: apiPandit?.name ?? "Pandit Ji",
    about: apiPandit?.description ?? apiPandit?.bio ?? "",
    image: apiPandit?.image || "",
    price: String(price || 0),
    oldPrice: String(oldPrice || price || 0),
    highlights: features.slice(0, 4),
    gallery: [apiPandit?.image].filter(Boolean),
  };
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-IN");
}

function Card({ item }) {
  const price = Number(item.price);

  return (
    <article className={styles.card}>
      <div className={styles.mediaCol}>
        <div className={styles.heroMedia}>
          <OfferBadge />
          {item.image ? (
            <>
              <Image
                src={item.image}
                alt={item.title}
                fill
                className={`${styles.image} ${styles.imageDesktop}`}
                sizes="(max-width: 768px) 100vw, 46vw"
              />
              <Image
                src={item.image}
                alt={item.title}
                width={800}
                height={1000}
                className={`${styles.image} ${styles.imageMobile}`}
                sizes="100vw"
              />
            </>
          ) : null}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.headBlock}>
          <h3 className={styles.title}>{item.title}</h3>
          <div className={styles.metaRow}>
            <div className={styles.priceWrap}>
              <span className={styles.price}>₹ {formatNumber(price)}</span>
            </div>
          </div>
        </div>

        <ul className={styles.points}>
          {item.highlights.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <Button
          as={Link}
          variant="unstyled"
          className={styles.button}
          href={`/online-astrology/${item.slug}`}
        >
          Book Now <span className={styles.arrow} aria-hidden="true">›</span>
        </Button>
      </div>
    </article>
  );
}

export default function PanditSection({ pandits = [] } = {}) {
  const sourceList = Array.isArray(pandits) ? pandits : [];
  const topCards = sourceList.map((item) => mapApiPanditToCard(item));

  if (!topCards.length) return null;

  return (
    <section className={styles.section} aria-label="Meet our Pandit-Ji and Astrologers" id="book">
      <div className="container">
        <header className={styles.header}>
          <h2 className={styles.titleSection}>Astrologers</h2>
        </header>

        <div className={styles.grid}>
          {topCards.map((item, index) => (
            <Card
              key={item?.slug ?? item?.id ?? item?._id ?? `${item?.title ?? "item"}-${index}`}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
